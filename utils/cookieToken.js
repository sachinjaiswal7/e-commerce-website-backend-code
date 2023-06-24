
const cookieToken = (user , res) => {
    const token = user.getToken();
    return res.status(200).cookie("token",token,{expires : new Date(Date.now() + process.env.COOKIE_TIME *  24 * 60 * 60 * 1000),httpOnly : true}).json({
    success : true,
    user
    });
}


export default cookieToken;