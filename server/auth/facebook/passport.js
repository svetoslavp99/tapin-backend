var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var FB = require('fb');

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {

      console.log(accessToken);

      FB.setAccessToken(accessToken);
      FB.api('/oauth/access_token', 'GET', {
        client_id: config.facebook.clientID,
        client_secret: config.facebook.clientSecret,
        grant_type: 'client_credentials'
      }, function (data) {
        console.log('app access token: ', data);

        FB.setAccessToken(data.access_token);

        FB.api('/' + config.facebook.clientID + '/subscriptions', 'POST', {
          object: 'user',
          callback_url: 'http://193.108.24.246:9002/api/users/flipnow',
          //fields: 'about,about_me,activities,affiliations,allowed_restrictions,birthday,birthday_date,books,checkin_deal_claims,contact_email,current_location,education,education_history,email,email_hashes,events,family,feed,first_name,friend_request,has_added_app,hometown,hometown_location,hs_info,interests,is_app_user,is_blocked,last_name,likes,link,locale,location,meeting_for,meeting_sex,movies,music,name,notes_count,online_presence,photos,pic,picture,pic_https,pic_with_logo,pic_big,pic_big_https,pic_big_with_logo,pic_small,pic_small_https,pic_small_with_logo,pic_square,pic_square_https,pic_square_with_logo,political_views,profile_blurb,profile_update_time,profile_url,proxied_email,quotes,relationship_status,religion,gender,sex,significant_other_id,statuses,timezone,television,tv,verified,website,work,work_history,friends,platform,privacy,blocked,ip_optout,notifications,threads',
          fields: 'about,about_me,activities,affiliations,allowed_restrictions,birthday,birthday_date,books,checkin_deal_claims,contact_email,current_location,education,education_history,email,email_hashes,events,family,feed,first_name,has_added_app,hometown,hometown_location,hs_info,interests,is_app_user,is_blocked,last_name,likes,link,locale,location,meeting_for,meeting_sex,movies,music,name,notes_count,online_presence,photos,pic,picture,pic_https,pic_with_logo,pic_big,pic_big_https,pic_big_with_logo,pic_small,pic_small_https,pic_small_with_logo,pic_square,pic_square_https,pic_square_with_logo,political_views,profile_blurb,profile_update_time,profile_url,proxied_email,quotes,relationship_status,religion,gender,sex,significant_other_id,statuses,timezone,television,tv,verified,website,work,work_history,friends,platform,privacy,blocked,ip_optout',
          verify_token: 'flipnow'
        }, function (err, data) {
          if (err) {
            return console.log('error: ', err);
          }
          console.log('real-time api success: ', err, data);

          User.findOne({
              'facebook.id': profile.id
            },
            function (err, user) {
              if (err) {
                return done(err);
              }
              if (!user) {
                user = new User({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  role: 'user',
                  username: profile.username || 'test',
                  provider: 'facebook',
                  facebook: profile._json
                });
                user.save(function (err) {
                  if (err) done(err);
                  return done(err, user);
                });
              } else {
                return done(err, user);
              }
            });
        });
      });

    }
  ));
};
