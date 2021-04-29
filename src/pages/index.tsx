import React,{ useEffect } from 'react';
import { Menu, Dropdown, Avatar } from 'antd';
import {history} from "umi"
import styles from './index.less';
const IndexPage=()=>{
  const menu = (
    <Menu>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" onClick={()=>logout()}>
          退出登录
        </a>
      </Menu.Item>
    </Menu>
  );
  const logout=()=>{
    sessionStorage.removeItem('roles')
    history.push('/login')
  }
  
  return (
    <div>
      <div>
        <Dropdown overlay={menu} placement="bottomCenter" arrow>
          <div className={styles.user}>{sessionStorage.getItem('roles')}</div>
        </Dropdown>
      </div>
      <div style={{textAlign:"center",lineHeight:'100vh',height:'100vh'}}>我是一个主页....</div>
    </div>
  );
}
export default IndexPage
