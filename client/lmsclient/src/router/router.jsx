import {
    createBrowserRouter,
  
  } from "react-router-dom";
  import React from 'react'
import Home from '../components/Login.jsx';
import Dashboard from '../pages/User/Dashboard.jsx';
import Layout from '../Layout.jsx'

//User
import CoursePage from '../pages/User/Course/CoursePage.jsx';
const router = createBrowserRouter(
  [
      
    {
          path: "/", element:<Layout/>,
           children: [
        {
          path: "/",   element: <Home />,
        },
       
      

      ]
     },

      // USER ROUTES
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      { index: true, element: <CoursePage /> }, // default active page
   
    ],
  },
   
  ],
 
);

  export default router;