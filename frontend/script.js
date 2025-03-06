
async function testing(){
    const prodUrl = "https://sly-ecommerce-api.onrender.com";
    const testUrl = "http://localhost:3000"
    const res = await fetch(prodUrl +"/api/v1/auth/vendor/sign-up",{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            // add any additional headers as needed
        },
        body: JSON.stringify({
            "firstName": "William",
            "lastName": "Wonder",
            "email": "wjsdfjsd@gmail.com",
            "password": "password",
            "phoneNumber": "+sdjjfkadjklfjkdnj"
        })
    }) ;

    const data = await res.json();
    console.log(data);
}

testing();