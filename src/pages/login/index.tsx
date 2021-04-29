import React, { useEffect } from "react"
import { Form, Input, Button } from 'antd';
import { history } from 'umi'
const index=()=>{
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  const onFinish = (values: any) => {
    let username = values.username;
    let password = values.password;
    if(username==="admin"&&password==="admin"){
      console.log("验证通过")
      sessionStorage.setItem('roles','admin')
      history.push('/index')
    }else{
      history.push('/error')
    }
  };

  const onFinishFailed = (errorInfo: any) => {};
  const myBox={
    border:'1px solid #c3c3c3',
    margin:'0px auto',
    position: "absolute",
    top: '50%',
    left: '50%',
    width: '400px',
    height:' 400px',
    marginTop: '-200px',
    marginLeft: '-200px',
    display: 'block',
    padding:'20px'
  }
  const form:any = Form.useForm()
  const myForm = form[0]
  useEffect(()=>{
    myForm.setFieldsValue({username:'admin'})
    myForm.setFieldsValue({password:'admin'})
  },[])
  return (
    <div>
      <div style={myBox}>
        <div style={{textAlign:"center",fontSize:'20px'}}>登录</div>
        <Form
        form={myForm}
        style={{marginTop:60}}
        {...layout}
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit" style={{width:'150px'}}>
            登录
          </Button>
        </Form.Item>
      </Form>
      </div>
    </div>
   
  )
}
export default index