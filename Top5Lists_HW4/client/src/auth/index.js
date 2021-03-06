import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import api from '../api'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    REGISTER_USER: "REGISTER_USER"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                });
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        try {
            const response = await api.getLoggedIn();
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.SET_LOGGED_IN,
                    payload: {
                        loggedIn: response.data.loggedIn,
                        user: response.data.user
                    }
                });
            }
        } catch (err) {
            console.log("401: Not Authorized (User not Logged in or Invalid User)");
        }
    }

    auth.registerUser = async function(userData, store) {
        try
        {
            const response = await api.registerUser(userData);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: response.data.user
                    }
                })
                history.push("/");
            }
        } catch (err) {
            // console.log("USER EXISTS!");
            // console.log(err.response.data.errorMessage); // Gets Error Message
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: null
                }
            })
            return err.response;
        }
    }

    auth.loginUser = async function(userData, store) {
        try
        {
            // console.log(userData);
            const response = await api.loginUser(userData);
            if (response.status === 200) {
                // console.log(response.data);
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: response.data.user
                    }
                });
                history.push("/");
                store.loadIdNamePairs();
            }
        } catch (err) {
            // console.log("auth.loginUser failed.");
            authReducer({
                type: AuthActionType.SET_LOGGED_IN,
                payload: {
                    loggedIn: false,
                    user: null
                }
            });
            // console.log(err);
            return err.response;
        }
    }

    auth.logoutUser = async function() {
        try
        {
            console.log("Logged out!");
            const response = await api.logoutUser();
            if (response.status === 200) {
                console.log("Logging Out...");
                setAuth({
                    user: null,
                    loggedIn: false
                });
                history.push("/");
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };