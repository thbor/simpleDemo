框架：react+umi
是否登录根据sessionStorage里面的roles
.umirc.ts 里面wrappers在需要检查是否登录的页面判断是否有roles且未admin，登录则跳到主页，没登录则跳转login页面
防止用户乱输入路由地址，加上*判断404页面，即没有找到路由
页面比较简陋，没有做样式
登录：
![Image](https://github.com/thbor/simpleDemo/blob/gh-pages/login.png)
<br>
主页右上角用户名和退出：
![Image](https://github.com/thbor/simpleDemo/blob/gh-pages/logout.png)
<br>
错误：
1.没有登录
![Image](https://github.com/thbor/simpleDemo/blob/gh-pages/error.png)
2.没有找到路由
![Image](https://github.com/thbor/simpleDemo/blob/gh-pages/404.png)




