import {
    createBrowserRouter,
  
  } from "react-router-dom";
  import React from 'react'
import Home from '../components/Login.jsx';
import Dashboard from '../pages/User/Dashboard.jsx';
import Layout from '../Layout.jsx'

//User
import CoursePage from '../pages/User/Course/CoursePage.jsx';
import CourseOverview from "../pages/User/Course/CourseDetails.jsx";
import Overview from "../pages/User/Course/components/Overview.jsx";
import Materials from "../pages/User/Course/components/Materials.jsx";
import Announcements from "../pages/User/Course/components/Announcements.jsx";
import Quiz from "../pages/User/Course/components/Quiz.jsx";
import Assignments from "../pages/User/Course/components/Assignments.jsx";
import Chat from "../pages/User/Course/components/Chat.jsx";
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
        { index: true, element: <CoursePage /> },
        { path: "courseOverview", element: <CourseOverview /> },
        {
        path: "courseOverview/",  // need to add course-id 
        element: <CourseOverview />,
        children: [
          { path: "", element: <Overview /> },      // default tab
          { path: "materials", element: <Materials /> },
          { path: "quiz", element: <Quiz /> },
          { path: "assignments", element: <Assignments /> },
          { path: "chat", element: <Chat /> },
          { path: "announcements", element: <Announcements /> },
        ],
      },
    
   
    ],
  },
   
  ],
 
);

  export default router;