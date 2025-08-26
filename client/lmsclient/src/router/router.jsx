import {
    createBrowserRouter,
  
  } from "react-router-dom";
  import React from 'react'
import Home from '../Auth/Login.jsx';
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
import Chat from "../pages/User/Course/components/CourseChat.jsx";
import Profile from "../pages/User/Profile/Profile.jsx";
import Notifications from "../pages/User/Notifications/Notifications.jsx";
import UserChat from "../pages/User/Chat/Chat.jsx";
import AChat from "../pages/User/Chat/Academicchat.jsx";

//Admin
import DashboardAdmin from '../pages/Admin/Dashboard.jsx';
import UserRegistration from '../pages/Admin/pages/UserLists.jsx';
import CourseManagement from '../pages/Admin/pages/CourseManagement.jsx';
import AcademicYearManagement from '../pages/Admin/pages/AcademicYearManagement.jsx';
import CourseOfferingManagement from '../pages/Admin/pages/CourseOfferingManagement.jsx';
import EnrollmentManagement from '../pages/Admin/pages/EnrollmentManagement.jsx';
import AnnouncementManagement from '../pages/Admin/pages/AnnouncementManagement.jsx';
import ChatRoomManagement from '../pages/Admin/pages/ChatRoomManagement.jsx';
import DepartmentManagement from '../pages/Admin/pages/DepartmentManagement.jsx';
import PositionManagement from '../pages/Admin/pages/PositionManagement.jsx';
import MajorManagement from '../pages/Admin/pages/MajorManagement.jsx';

//teacher
// import TeacherDashboard from '../pages/Teacher/Dashboard.jsx';
// import TeacherCoursePage from '../pages/Teacher/Course/Coursepage.jsx';
// import TeacherCourseList from '../pages/Teacher/Course/CourseList.jsx';
// import TOverview from '../pages/Teacher/Course/components/Overview.jsx';
// import TMaterials from '../pages/Teacher/Course/components/Materials.jsx';
// import Announcementsteacher from '../pages/Teacher/Course/components/Annoucements.jsx';
// import TQuizzes from '../pages/Teacher/Course/components/Quizzes.jsx';


const router = createBrowserRouter(
  [
      
    {
          path: "/login", element:<Layout/>,
           children: [
        {
          index: true,element: <Home />,
        },
       
      

      ]
     },

     // USER ROUTES
 {
   path: "/dashboard",
   element: <Dashboard />,
   children: [
       { index: true, element: <CoursePage /> },
       { path: "profile", element: <Profile /> },
       { path: "notification", element: <Notifications /> },
       {  path: "chat", element: <UserChat />},
       {path: "academic-chat",element: <AChat />},  //need with course-id for dbms

       {
       path: "courses/:id",  // Fixed: removed leading slash for nested route
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

     // ADMIN ROUTES
 {
   path: "/admin",
   element: <DashboardAdmin />,
   children: [
     { index: true, element: <DepartmentManagement /> },
     { path: "users", element: <UserRegistration /> },
     { path: "courses", element: <CourseManagement /> },
     { path: "academic-years", element: <AcademicYearManagement /> },
     { path: "course-offerings", element: <CourseOfferingManagement /> },
     { path: "enrollments", element: <EnrollmentManagement /> },
     { path: "announcements", element: <AnnouncementManagement /> },
     { path: "chat-rooms", element: <ChatRoomManagement /> },
     { path: "positions", element: <PositionManagement /> },
     { path: "departments", element: <DepartmentManagement /> },
       { path: "majors", element: <MajorManagement /> },
   ],
 },

 //Teacher route 
//  {
//    path: "/teacherdashboard",
//    element: <TeacherDashboard />,
//    children: [
//        { index: true, element: <TeacherCoursePage /> },
      //  { path: "/dashboard/profile", element: <Profile /> },
      //  { path: "/dashboard/notifications", element: <Notifications /> },
      //  {  path: "/dashboard/chat", element: <UserChat />},
      //  {path: "/dashboard/academic-chat",element: <AChat />},  //need with course-id for dbms
      //  {
      //  path: "courselist/",
      //  element: <TeacherCourseList />,
      //  children: [
      //    { path: "", element: <TOverview /> },      // default tab
        //  { path: "materials", element: <TMaterials /> },
        //  { path: "quiz", element: <TQuizzes /> },
        //  { path: "assignments", element: <Assignments /> },
        //  { path: "chat", element: <Chat /> },
        //  { path: "announcements", element: <Announcements /> },
    //      { path: "announcements", element: <Announcementsteacher /> },
    //    ],
    //  },
   
  
//    ],
//  },

     
  ],
 
);

  export default router;