import React from "react";
import Error404 from '../../components/Errors/404/Error404'

const System404 = () => {
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexGrow: 1}}>
      <Error404 style={{flexGrow: 0.25}} />
    </div>
  )
}

export default System404
