// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     async headers(){
//         return[
//             {
//                 source:"/embed",
//                 headers:[
//                     {
//                         key: "Content-Security-Policy",
//                         value: "frame-src 'self' https://vehiq-waitlist.created.app"
//                     }
//                 ]
//             }
//         ]
//     }
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
        serverComponentsHmrCache:false,
    },
    images:{
        remotePatterns:[
            {protocol:"https",
             hostname:"jhicrhaffrmagujptkqd.supabase.co"
            }
        ]
    },
    async headers() {
        return [
            {
                source: "/embed",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "frame-ancestors 'self' https://vehiq-waitlist.created.app;"
                    }
                ]
            }
        ];
    }
};

export default nextConfig;
