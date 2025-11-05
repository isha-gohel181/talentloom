// const cookieToken = async (user, res) => {

//     const accessToken = await user.generateAccessToken()
//     const refreshToken = await user.generateRefreshToken()

//     user.refreshToken = refreshToken;

//     const options = {
//         httpOnly: true,
//         secure: true,
//         maxAge: 3 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
//         sameSite: "Strict"
//     }

//     return res.status(201)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json({
//             success: true,
//             message: `User created`,
//             user:user.$ignore("password"), accessToken, refreshToken
//         })
// }

// export { cookieToken }
const cookieToken = async (user, res) => {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
  
    // Save refresh token in user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    };
  
    // Convert Mongoose doc → plain JS object
    const safeUser = user.toObject();
    delete safeUser.password; // Remove sensitive field
  
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User created successfully",
        user: safeUser,
        accessToken,
        refreshToken,
      });
  };
  
  export { cookieToken };
  