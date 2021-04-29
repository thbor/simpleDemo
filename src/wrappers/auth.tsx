import { Redirect } from 'umi'
import React from "react"

export default (props:any) => {
  const isLogin = sessionStorage.getItem('roles') !== null;
  if (isLogin) {
    let role = sessionStorage.getItem('roles')
    const isAuthorized = role&&role==="admin";
    if (isAuthorized) {
      return <div>{ props.children }</div>;
    }
  }
  return <Redirect to="/login" />
}
