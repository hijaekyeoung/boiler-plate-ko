const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const config = require("./config/key");
const cookieParser = require('cookie-parser');
const { User } = require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//application/json
app.use(bodyParser.json());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))



app.get('/', (req, res) => res.send('우리가족 건강히 오래 살게 해주세요!'))

// app.post('/register', (req, res) => {
//   // 회원가입에 필요한 정보들을 client에서 가져오면 
//   // 그것들을 데이터 베이스에 넣어준다.

//   const user = new User(req.body)

//   user.save((err, userInfo) => {
//     if(err) return res.json({success: false, err})
//     return res.status(200).json({
//       success: true
//     })
//   })
// })

app.post('/register', async (req, res) => {
  try {
    // 회원가입에 필요한 정보들을 client에서 가져오면 
    // 그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body);

    const userInfo = await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error occurred during user registration:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/login', async (req, res) => {
  
  try {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    const user = await User.findOne({email: req.body.email});
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    
    const isMatch = await user.comparePassword(req.body.password);
    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
    if(!isMatch) {
      return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
    }
    
    // 비밀번호까지 같다면 token을 생성하기.
    const token = await user.generateToken();
    // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
    res.cookie("x_auth", user.token)
    .status(200)
    .json({loginSuccess: true, userId: user._id})
      
  } catch(err) {
    console.error('Error occurred during user login: ', err);
    res.status(400).json({loginSuccess: false, error: err.message});
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))