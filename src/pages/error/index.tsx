import React from "react"
import {Button} from "antd"
import "./index.less"
import {history} from "umi"
const index=()=>{
  
  return (
    <div style={{height:'100vh'}} className="parent">
      <div style={{fontSize:'20px',textAlign:'center'}}>
        {sessionStorage.getItem('roles')==="admin"?
        <div className="child">
          <div style={{fontSize:'20px'}}>404</div>
          <Button onClick={()=>history.push('/')}>返回主页</Button>
        </div>
        :
        <div className="child">
          <div>密码错误或未登录</div>
          <Button onClick={()=>history.push('/login')}>返回登录</Button>
        </div>
        }
      </div>
    </div>
  )
}
export default index