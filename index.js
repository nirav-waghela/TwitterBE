const express = require('express')
const app = express();
const passport = require('passport');
const bodyParser = require("body-parser");
const TwitterStrategy = require('passport-twitter').Strategy
const session = require('express-session');
const Twit = require('twit')
const cors = require("cors");
const CONSTANT = require('./constant')

app.use(cors());
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello world')
});

app.use(session({ secret: 'whatever', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new TwitterStrategy({
    consumerKey: CONSTANT.key,
    consumerSecret: CONSTANT.secretKey,
    callbackURL: CONSTANT.callbackURL
}, function (token, tokenSecret, profile, callback) {
    return callback(null, { profile, token, tokenSecret });
}));

app.get('/auth/twitter', passport.authenticate('twitter'));


app.get('/auth/twitter/callback',
    passport.authenticate(
        'twitter',
        { failureRedirect: '/login' },
    ), (req, res) => {
        T = new Twit({
            consumer_key: CONSTANT.key,
            consumer_secret: CONSTANT.secretKey,
            access_token: req.user.token,
            access_token_secret: req.user.tokenSecret
        })
        res.redirect('http://localhost:4000?token=' + req.user.token + '&tokenSecret=' + req.user.tokenSecret + '&name=' + req.user.profile.username + '&id=' + req.user.profile.id)
    }
);

app.post('/profile', async (req, resp) => {
    console.log(req.body)
    T = new Twit({
        consumer_key: CONSTANT.key,
        consumer_secret: CONSTANT.secretKey,
        access_token: req.body.token,
        access_token_secret: req.body.tokenSecret
    })
    await T.get('account/verify_credentials', async (err, res) => {
        try {
            if (res) {
                await T.get('/users/show', { 'id': req.body.id }, async (err, res) => {
                    try {
                        resp.status(200).json(res)
                    } catch{
                        if (err) {
                            res.redirect('http://localhost:3000/auth/twitter')
                        }
                    }
                })
            }
        }
        catch{
            if (err) {
                res.redirect('http://localhost:3000/auth/twitter')
            }
        }
    })

})


app.post('/myTweets', async (req, resp) => {
    console.log(req.body)
    T = new Twit({
        consumer_key: CONSTANT.key,
        consumer_secret: CONSTANT.secretKey,
        access_token: req.body.token,
        access_token_secret: req.body.tokenSecret
    })
    await T.get('account/verify_credentials', async (err, res) => {
        try {
            if (res) {
                await T.get('/statuses/user_timeline', (err, res) => {
                    try {
                        resp.status(200).json(res)
                    }
                    catch{
                        res.redirect('http://localhost:3000/auth/twitter')
                    }
                })
            }
        }
        catch{
            if (err) {
                res.redirect('http://localhost:3000/auth/twitter')
            }
        }
    })

})

app.post('/getTweets', async (req, resp) => {
    console.log(req.body)
    T = new Twit({
        consumer_key: CONSTANT.key,
        consumer_secret: CONSTANT.secretKey,
        access_token: req.body.token,
        access_token_secret: req.body.tokenSecret
    })
    await T.get('account/verify_credentials', async (err, res) => {
        try {
            if (res) {
                await T.get('/statuses/mentions_timeline', (err, res) => {
                    try {
                        resp.status(200).json(res)
                    }
                    catch{
                        res.redirect('http://localhost:3000/auth/twitter')
                    }
                })
            }
        }
        catch{
            if (err) {
                res.redirect('http://localhost:3000/auth/twitter')
            }
        }
    })

})

passport.serializeUser(function (user, callback) {
    callback(null, user);
})

passport.deserializeUser(function (obj, callback) {
    callback(null, obj);
})

app.listen(3000, () => {
    console.log('App listening on port 3000')
});