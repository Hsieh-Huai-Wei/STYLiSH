const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { signUp, signIn, fbSignIn, getUserProfile,
} = require('../contorllers/user_controller');

router.route('/user/signup').post(wrapAsync(signUp));
router.route('/user/signin').post(wrapAsync(signIn));
router.route('/fbsignin').post(wrapAsync(fbSignIn));
router.route('/user/profile').post(wrapAsync(getUserProfile));

module.exports = router;
