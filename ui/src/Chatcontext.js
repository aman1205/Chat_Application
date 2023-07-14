import React, { Children, createContext, useReducer } from 'react'
import useContext, { useState } from "react";
import { UserContext } from './UserContext';


export const ChatContext = createContext()

export const ChatContextProvider = ({ Children }) => {

    const{username,id}  = useContext(UserContext);
    console.log(id)

    const INITIAL_STATE = {
        chatId: "null",
        user:{}

    }

    const chatReducer = (state, action) => {

        switch (action.type) {
            case "Change User":
                return {
                    user: action.playload,
                    chatId:
                        currentUser.uid > action.payload.uid
                            ? currentUser.uid + action.payload.uid
                            : action.payload.uid + currentUser.uid,

                }
            default:
                return state;
        }
    }
    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    return (
        <ChatContext.Provider value={{ data: state, dispatch }}>
            {Children}
        </ChatContext.Provider>

    )
}