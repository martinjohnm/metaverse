




const { default: axios } = require("axios")

const BE_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

function sum(a,b) {
    return a + b
}
describe("authentication", () => {
    test("User is able to sign up", async () => {
        const username = "john" + Math.random();
        const password = "123456"
        const response = await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            type : "admin"
        })

        expect(response.statusCode).toBe(200)

        const updatedReponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            type : "admin"
        })
        expect(updatedReponse.statusCode).toBe(400)
    })

    test("Signup request fails if the username is empty", async () => {
        const username = `john-${Math.random()}`
        const password = "1234"

        const response = await axios.post(`${BE_URL}/api/v1/signup`, {
            password
        })

        expect(response.statusCode).toBe(400)
    })

    test("Signin succeeds if the username and password are correct", async () => {
        const username = `john-${Math.random()}`
        const password = "1234567"

        axios.post(`${BE_URL}/api/v1/signup`, {
            username, 
            password
        })
        const respnse = axios.post(`${BE_URL}/api/v1/signin`, {
            username, 
            password
        })

        expect(respnse.statusCode).toBe(200)
        expect(respnse.body.token).toBeDefined()
    })
    test("Signin fails if the username and password are incorrect", async () => {
        const username = `john-${Math.random()}`
        const password = "1234567"

        axios.post(`${BE_URL}/api/v1/signup`, {
            username, 
            password
        })
        const respnse = axios.post(`${BE_URL}/api/v1/signin`, {
            username : "werofjjop", 
            password
        })

        expect(respnse.statusCode).toBe(411)
        expect(respnse.body.token).toBeDefined()
    })
})

describe("User information end points", () => {

    let token = ""
    let avatarId = ""
    beforeAll( async () => {
        console.log("before all was called")
        const username = `john-${Math.random()}`
        const password = "1234567"

        await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            type : "admin"
        })


        const response = await axios.post(`${BE_URL}/api/v1/signin`, {
            username,
            password
        })

        const avatarResponse = await axios.post(`${BE_URL}/api/v1/admin/avatar`, {

            imageUrl : "fasfasfasfda",
            name : "Tim"
            })

        avatarId = avatarResponse.data.avatarId

        token = response.data.token

        
    })

    test("User can't update their metadata with wrong avatar id",async () => {

        const response = await axios.post(`${BE_URL}/api/v1/user/metadata`, {
            avatarId : "1234567"
        }, {
            headers : {
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(400)

    })

    test("User can update their metadata with the right avatar id", async() => {
        const response = await axios.post(`${BE_URL}/api/v1/user/metadata`, {
            avatarId
        }, {
            headers : {
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(200)
    })

    test("User can't update their metadata if the auth header is not present", async() => {
        const response = await axios.post(`${BE_URL}/api/v1/user/metadata`, {
            avatarId
        })

        expect(response.statusCode).toBe(403)
    })
})

describe("User avatar informatin", () => {

    let avatarId;
    let token;
    let userId;
    beforeAll( async () => {
        console.log("before all was called")
        const username = `john-${Math.random()}`
        const password = "1234567"

        const signUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            type : "admin"
        })

        userId = signUpResponse.data.userId

        const response = await axios.post(`${BE_URL}/api/v1/signin`, {
            username,
            password,
            type : "admin"
        })

        const avatarResponse = await axios.post(`${BE_URL}/api/v1/admin/avatar`, {

            imageUrl : "fasfasfasfda",
            name : "Tim"
            })

        avatarId = avatarResponse.data.avatarId

        token = response.data.token

        
    })

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BE_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`)
        expect(response.data.avatars.length).toBe(1)
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the recently created avatar", async () => {
        const response = await axios.get(`${BE_URL}/api/v1/avatars`)

        expect(response.data.avatars.length).not.toBe(0)

        const currAvatar = response.data.avatars.find(x => x.id === avatarId);
        expect(currAvatar).toBeDefined()
    })
})

describe("Space Information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;

    beforeAll( async () => {
        console.log("before all was called")
        const username = `john-${Math.random()}`
        const password = "1234567"

        // before all tests get a userId, adminId, adminToken and userToken, 
        // and create a some elements and map
        const adminSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            type : "admin"
        })

        
        adminId = adminSignUpResponse.data.userId

        const adminSigninResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username,
            password,
            type : "admin"
        })
        adminToken = adminSigninResponse.data.token
        

        const userSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username : username + "-user",
            password,
            type : "admin"
        })

        
        userId = userSignUpResponse.data.userId

        const userSigninResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username: username + "-user", 
            password,
            type : "admin"
        })
        userToken = userSigninResponse.data.token
        
        const element1 = await axios.post(`${BE_URL}/api/v1/admin/element`, {
            imageUrl : "",
            width : "1",
            height : "3",
            static : true
        }, {
            headers : { 
                Authorization : `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BE_URL}/api/v1/admin/element`, {
            imageUrl : "",
            width : "1",
            height : "3",
            static : true
        }, {
            headers : { 
                Authorization : `Bearer ${adminToken}`
            }
        })

        element1Id = element1.id
        element2Id = element2.id

        const map = await axios.post(`${BE_URL}/api/v1/admin/map`, {
                "thumbnail": "https://thumbnail.com/a.png",
                "dimensions": "100x200",
                "name": "100 person interview room",
                "defaultElements": [{
                            elementId : element1Id,
                            x: 20,
                            y: 20
                   }, {
                             elementId: element1Id,
                             x: 18,
                             y: 20
                    }, {
                             elementId: element2Id,
                             x: 19,
                             y: 20
                     }]

        }, {
            headers : {
                Authorization : `Bearer ${token}`
            }
        })

        mapId = map.id
        
    })

    test("User is able to create a space", async () => {
        const response = await axios.post(`${BE_URL}/api/v1/space`, {
            name : "Test",
            dimensions : "100*200",
            mapId : mapId
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        expect(response.spaceId).toBeDefined()
    })


    test("User is able to create a space without mapId (Empty space)", async () => {
        const response = await axios.post(`${BE_URL}/api/v1/space`, {
            name : "Test",
            dimensions : "100*200"
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        expect(response.spaceId).toBeDefined()
    })

    test("User is not able to create a space without mapId and dimensions", async () => {
        const response = await axios.post(`${BE_URL}/api/v1/space`, {
            name : "Test"
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400)
    })

    test("User is not able to delete a space that doesnot exist", async () => {
        const response = await axios.delete(`${BE_URL}/api/v1/space/randomIdDoestnotexist`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400)
    })

    test("User is able to delete a space that does exist", async () => {
        const response = await axios.post(`${BE_URL}/api/v1/space`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BE_URL}/api/v1/space/${response.data.spaceId}`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(deleteResponse.statusCode).toBe(200)
    })

    test("User should not be able to delete a space created by another user", async () => {
        const response = await axios.post(`${BE_URL}/api/v1/space`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BE_URL}/api/v1/space/${response.data.spaceId}`, {
            headers : {
                Authorization : `Bearer ${adminToken}`
            }
        })
        expect(deleteResponse.statusCode).toBe(400)
    })

    test("Admin has no space initially", async () => {
        const response = await axios.get(`${BE_URL}/api/v1/space/all`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        expect(response.data.spaces.length).toBe(0)
    })

    test("Admin has no space initially", async () => {
        const spaceCreateResponse = await axios.post(`${BE_URL}/api/v1/space/all`, {
            name : "Test",
            dimensions : "100*200"
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        const response = await axios.get(`${BE_URL}/api/v1/space/all`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId)
        expect(response.data.spaces.length).toBe(1)
        expect(filteredSpace.length).toBeDefined()
    })
    
})

describe("Arena endpoints", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    let spaceId;

    beforeAll( async () => {
        console.log("before all was called")
        const username = `john-${Math.random()}`
        const password = "1234567"

        // before all tests get a userId, adminId, adminToken and userToken, 
        // and create a some elements and map
        const adminSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            type : "admin"
        })

        
        adminId = adminSignUpResponse.data.userId

        const adminSigninResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username,
            password,
            type : "admin"
        })
        adminToken = adminSigninResponse.data.token
        

        const userSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username : username  +"-user",
            password,
            type : "admin"
        })

        
        userId = userSignUpResponse.data.userId

        const userSigninResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username: username  +"-user",
            password,
            type : "admin"
        })
        userToken = userSigninResponse.data.token
        
            const element1 = await axios.post(`${BE_URL}/api/v1/admin/element`, {
                imageUrl : "",
                width : "1",
                height : "3",
                static : true
            }, {
                headers : { 
                    Authorization : `Bearer ${adminToken}`
                }
            })

            const element2 = await axios.post(`${BE_URL}/api/v1/admin/element`, {
                imageUrl : "",
                width : "1",
                height : "3",
                static : true
            }, {
                headers : { 
                    Authorization : `Bearer ${adminToken}`
                }
            })

            element1Id = element1.id
            element2Id = element2.id

            const map = await axios.post(`${BE_URL}/api/v1/admin/map`, {
                    "thumbnail": "https://thumbnail.com/a.png",
                    "dimensions": "100x200",
                    "name": "100 person interview room",
                    "defaultElements": [{
                                elementId : element1Id,
                                x: 20,
                                y: 20
                    }, {
                                elementId: element1Id,
                                x: 18,
                                y: 20
                        }, {
                                elementId: element2Id,
                                x: 19,
                                y: 20
                        }]

            }, {
                headers : {
                    Authorization : `Bearer ${token}`
                }
            })

            const space = await axios.post(`${BE_URL}/api/v1/`, {
                name : "Test",
                dimensions : "100*200",
                mapId : mapId
            }, {
                headers : {
                    Authorization : `Bearer ${userToken}`
                }
            })

            spaceId = space.spaceId

            mapId = map.id
            
    })

    test("Incorrect spaceId returns a 400", async( ) => {
        const response = await axios.get(`${BE_URL}/api/v1/space/123456dsfa`, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400)
    })

    test("Correct spaceId returns all the elements", async( ) => {
        const response = await axios.get(`${BE_URL}/api/v1/space/${spaceId}`,{
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })
        expect(response.dimensions).toBe("100*200")
        expect(response.data.elements.length).toBe(3)
    })

    test("Delete endpoint is able to delete an element", async( ) => {

        const response = await axios.get(`${BE_URL}/api/v1/space/${spaceId}`, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })

        await axios.delete(`${BE_URL}/api/v1/space/element`, {
            spaceId,
            elementId: response.data.elements[0].id
        }, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BE_URL}/api/v1/space/${spaceId}`, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })
        expect(newResponse.data.elements.length).toBe(3)
    })

    test("Adding elements fails if the element lies outside the dimensions", async( ) => {

        const response = await axios.get(`${BE_URL}/api/v1/space/element`,{
            "elementId" : element1Id,
            "spaceId" : spaceId,
            "x" : 10000,
            "y" : 20000
        }, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })

       expect(response.statusCode).toBe(400)
    })

    test("Adding elements works as expected", async( ) => {

        await axios.get(`${BE_URL}/api/v1/space/element`,{
            "elementId" : element1Id,
            "spaceId" : spaceId,
            "x" : 50,
            "y" : 20
        }, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BE_URL}/api/v1/space/${spaceId}`, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })

       expect(newResponse.data.elements.length).toBe(3)
    })
})

describe("Create an element", () => {
  
    let adminToken;
    let adminId;
    let userToken;
    let userId;

    beforeAll( async () => {
        console.log("before all was called")
        const username = `john-${Math.random()}`
        const password = "1234567"

        // before all tests get a userId, adminId, adminToken and userToken, 
        // and create a some elements and map
        const adminSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            type : "admin"
        })

        
        adminId = adminSignUpResponse.data.userId

        const adminSigninResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username,
            password,
            type : "admin"
        })
        adminToken = adminSigninResponse.data.token
        

        const userSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username : username  +"-user",
            password,
            type : "admin"
        })

        
        userId = userSignUpResponse.data.userId

        const userSigninResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username: username  +"-user",
            password,
            type : "admin"
        })
        userToken = userSigninResponse.data.token
        
        
    })

    test("User is not able to hit admin endpoints", async () => {


        const elementResponse = await axios.post(`${BE_URL}/api/v1/admin/element`, {
            imageUrl : "",
            width : "1",
            height : "3",
            static : true
        }, {
            headers : { 
                Authorization : `Bearer ${userToken}`
            }
        })


        const mapResponse = await axios.post(`${BE_URL}/api/v1/admin/map`, {
                "thumbnail": "https://thumbnail.com/a.png",
                "dimensions": "100x200",
                "name": "100 person interview room",
                "defaultElements": []

        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        const createAvatarResponse = await axios.post(`${BE_URL}/api/v1/admin/avatar`, {
            "imageUrl" : "https://img.com",
            "name": "Timmy"
        }, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })

        const updateElementResponse = await axios.put(`${BE_URL}/api/v1/admin/element/123`, {
            "imageUrl" : "https://img.com",
            "name": "Timmy"
        }, {
            headers : {
                "Authorization" : `Bearer ${userToken}`
            }
        })


        expect(elementResponse.statusCode).toBe(403)
        expect(mapResponse.statusCode).toBe(403)
        expect(createAvatarResponse.statusCode).toBe(403)
        expect(updateElementResponse.statusCode).toBe(403)

    })
})

describe("Websocket tests", () => {
    let adminToken;
    let adminUserId;
    let userToken;
    let userId;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = [];
    let ws2Messages = [];

    function waitforAndPopLatestMessage(messageArray) {
        return new Promise(r => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift())
            } else {
                let interval = setInterval(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupHTTP() {

        const username = `john-${Math.random()}`
        const password = "123456"
        const adminSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username,
            password,
            role : "admin"
        })

        const adminSignInResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username,
            password
        })

        adminUserId = adminSignUpResponse.data.userId;
        adminToken = adminSignInResponse.data.token

        const userSignUpResponse = await axios.post(`${BE_URL}/api/v1/signup`, {
            username: username + `-user`,
            password
        })

        const userSignInResponse = await axios.post(`${BE_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        })
        userId = userSignUpResponse.data.userId;
        userToken = userSignInResponse.data.token;

        const element1Response = await axios.post(`${BE_URL}/api/v1/admin/element`, {
            imageUrl : "",
            width : "1",
            height : "3",
            static : true
        }, {
            headers : { 
                Authorization : `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BE_URL}/api/v1/admin/element`, {
            imageUrl : "",
            width : "1",
            height : "3",
            static : true
        }, {
            headers : { 
                Authorization : `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.id
        element2Id = element2Response.id

        const mapResponse = await axios.post(`${BE_URL}/api/v1/admin/map`, {
                "thumbnail": "https://thumbnail.com/a.png",
                "dimensions": "100x200",
                "name": "100 person interview room",
                "defaultElements": [{
                            elementId : element1Id,
                            x: 20,
                            y: 20
                   }, {
                             elementId: element1Id,
                             x: 18,
                             y: 20
                    }, {
                             elementId: element2Id,
                             x: 19,
                             y: 20
                     }]

        }, {
            headers : {
                Authorization : `Bearer ${token}`
            }
        })

        const spaceResponse = await axios.post(`${BE_URL}/api/v1/`, {
            name : "Test",
            dimensions : "100*200",
            mapId : mapId
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        spaceId = spaceResponse.spaceId

        mapId = mapResponse.id
        
    }


    async function setupWS() {
        ws1 = new WebSocket(WS_URL);
        ws2 = new WebSocket(WS_URL)

        await new Promise(r => {
            ws1.onopen = r
        })

        await new Promise(r => {
            ws2.onopen = r
        })


        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data))
        }

        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data))
        }

    }

    beforeAll(async () => {
        setupHTTP()
        setupWS()
    })

    test("Get back acknowledgement for joining the space", async () => {

        ws1.send(JSON.stringify({
            "type" : "join",
            "payload" : {
                "spaceId" : spaceId,
                "token" : adminToken
            }
        }))

        ws2.send(JSON.stringify({
            "type" : "join",
            "payload" : {
                "spaceId" : spaceId,
                "token" : userToken
            }
        }))

        const message1 = await waitforAndPopLatestMessage(ws1Messages)
        const message2 = await waitforAndPopLatestMessage(ws2Messages)

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")

        expect(message1.payload.users.length + message2.payload.users.length).toBe(1)
    })
})