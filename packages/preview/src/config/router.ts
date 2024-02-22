import MainLayout from "../layout/index";

export default [
    {
        path: '/',
        control: MainLayout,
        keepAlive: true,
        childs: [
            {
                path: '/',
                control: () => import("../pages/home"),
                keepAlive: true
            },
            {
                path: '/index.html',
                control: () => import("../pages/home"),
                keepAlive: true
            },
            {
                path: '/about/{page?:about}',
                control: () => import("../pages/about"),
                keepAlive: true
            },
        ]
    },
    {
        path: '/auth',
        control: () => import("../pages/auth/index"),
        childs: [
            {
                path: '/',
                control: () => import("../pages/auth/login"),
                keepAlive: false
            },
            {
                path: '/login',
                control: () => import("../pages/auth/login"),
                keepAlive: false
            }
            ,
            {
                path: '/recovery/password',
                control: () => import("../pages/auth/recoverypassword"),
                keepAlive: false
            }
        ]
    }
]
