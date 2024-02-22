// import axios from "axios";
// import { ApplicationService } from "movijs";
// import { UserModel } from "../model/user";

// var MainUrl = "";
// export function SetPath(path: string) {
//     MainUrl = path;
// }

// SetPath(window.location.origin);

// export var UrlPath = {
//     BaseUri: () => MainUrl + "/",
//     SimpleBaseUri: () => MainUrl,
//     ApiUrl: () => MainUrl + "/api/"
// }

// export function AxiosConfig(baseUrl) {
//     SetPath(baseUrl);
//     axios.interceptors.request.use(async function (config) {
//         if (config && config.headers && !config.headers["Content-Type"]) {
//             config.headers["Content-Type"] = "application/json";
//         }
//         const tmp = { ...config }
//         if (!tmp.url || !tmp.url.startsWith('http')) {
//             tmp.url = UrlPath.SimpleBaseUri() + tmp.url
//         }
//         var token = await UserModel.accessToken;
//         if (token) {
//             tmp.headers.Authorization = "BEARER " + token;
//         }
//         return tmp
//     });

//     axios.interceptors.response.use(
//         response => {
//             if (response.status == 401) { 
//                 // authService.signIn({ returnUrl: ApplicationService.current.route.path });
//                 ApplicationService.current.navigate("/auth/login")
//             }
//             return response;
//         },
//         error => { 
//             if (error && error.response) {
//                 if (error && error.response.status == 401) {
//                     // authService.signIn({ returnUrl: ApplicationService.current.route.path });
//                     ApplicationService.current.navigate("/auth/login")
//                 } else if (error && error.response.status == 423) {
//                     alert("Bu işlemi yapmak için gerekli izinlere sahip değilsiniz")
//                 }
//             } 
//             return error;
//         }
//     );
// }