import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import jsTPS from '../common/jsTPS'
import api from './store-request-api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import UpdateItem_Transaction from '../transactions/UpdateItem_Transaction'
import AuthContext from '../auth'
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    UNMARK_LIST_FOR_DELETION: "UNMARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_ITEM_EDIT_ACTIVE: "SET_ITEM_EDIT_ACTIVE",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_OPENED_LISTS: "SET_OPENED_LISTS",
    SET_BUTTON_STATE: "SET_BUTTON_STATE"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null,
        currentlyOpenedLists: [],
        buttonState: '0'
    });
    const history = useHistory();

    console.log("inside useGlobalStore");

    // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
    const { auth } = useContext(AuthContext);
    console.log("auth: " + auth);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: '0'
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: '0'
                })
            }
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter + 1,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: '0'
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: store.buttonState
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: payload,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: store.buttonState
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.UNMARK_LIST_FOR_DELETION: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: store.buttonState
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: '0'
                });
            }
            // START EDITING A LIST ITEM
            case GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: true,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: '0'
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: '0'
                });
            }
            // UPDATE OPENED LISTS
            case GlobalStoreActionType.SET_OPENED_LISTS: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: store.listMarkedForDeletion,
                    currentlyOpenedLists: payload,
                    buttonState: store.buttonState
                });
            }
            // Get BUTTON STATE
            case GlobalStoreActionType.SET_BUTTON_STATE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: store.listMarkedForDeletion,
                    currentlyOpenedLists: store.currentlyOpenedLists,
                    buttonState: payload
                });
            }
            default:
                return store;
        }
    }

    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = async function (id, newName) {
        let response = await api.getTop5ListById(id);
        if (response.status === 200) {
            let top5List = response.data.top5List;
            top5List.name = newName;
            async function updateList(top5List) {
                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.status === 200) {
                    async function getListPairs(top5List) {
                        response = await api.getTop5ListPairs();
                        if (response.status === 200) {
                            let pairsArray = response.data.idNamePairs;
                            storeReducer({
                                type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                payload: {
                                    idNamePairs: pairsArray,
                                    top5List: top5List
                                }
                            });
                        }
                    }
                    getListPairs(top5List);
                }
            }
            updateList(top5List);
        }
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        
        tps.clearAllTransactions();
        history.push("/");
    }

    // THIS FUNCTION CREATES A NEW LIST
    store.createNewList = async function () {
        let newListName = "Untitled" + store.newListCounter;
        console.log("AUTH USER IN STORE: " + auth.user);
        const response = await api.createTop5List(newListName, ["?", "?", "?", "?", "?"], auth.user.email, auth.user.username);
        console.log("createNewList response: " + response);
        if (response.status === 201) {
            tps.clearAllTransactions();
            let newList = response.data.top5List;
            storeReducer({
                type: GlobalStoreActionType.CREATE_NEW_LIST,
                payload: newList
            }
            );

            // IF IT'S A VALID LIST THEN LET'S START EDITING IT
            history.push("/top5list/" + newList._id);
        }
        else {
            console.log("API FAILED TO CREATE A NEW LIST");
        }
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = async function () {
        // console.log("store.loadIdNamePairs");
        const response = await api.getTop5ListPairs();
        if (response.status === 200) {
            let pairsArray = response.data.idNamePairs;
            storeReducer({
                type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                payload: pairsArray
            });
        }
        else {
            console.log("API FAILED TO GET THE LIST PAIRS");
        }
    }

    // THE FOLLOWING 5 FUNCTIONS ARE FOR COORDINATING THE DELETION
    // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
    // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
    // showDeleteListModal, and hideDeleteListModal
    store.markListForDeletion = async function (id) {
        // GET THE LIST
        let response = await api.getTop5ListById(id);
        if (response.status === 200) {
            let top5List = response.data.top5List;
            storeReducer({
                type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                payload: top5List
            });
        }
    }

    store.deleteList = async function (listToDelete) {
        let response = await api.deleteTop5ListById(listToDelete._id);
        if (response.status === 200) {
            store.loadIdNamePairs();
            history.push("/");
        }
    }

    store.deleteMarkedList = function () {
        store.deleteList(store.listMarkedForDeletion);
    }

    store.unmarkListForDeletion = function () {
        storeReducer({
            type: GlobalStoreActionType.UNMARK_LIST_FOR_DELETION,
            payload: null
        });
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = async function (id) {
        let response = await api.getTop5ListById(id);
        if (response.status === 200) {
            let top5List = response.data.top5List;

            response = await api.updateTop5ListById(top5List._id, top5List);
            if (response.status === 200) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: top5List
                });
                history.push("/top5list/" + top5List._id);
            }
        }
    }

    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }

    store.addUpdateItemTransaction = function (index, newText) {
        let oldText = store.currentList.items[index];
        let transaction = new UpdateItem_Transaction(store, index, oldText, newText);
        tps.addTransaction(transaction);
    }

    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }

    store.updateItem = function (index, newItem) {
        store.currentList.items[index] = newItem;
        store.updateCurrentList();
    }

    store.updateCurrentList = async function () {
        const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
        if (response.status === 200) {
            storeReducer({
                type: GlobalStoreActionType.SET_CURRENT_LIST,
                payload: store.currentList
            });
        }
    }

    store.addOpenedList = async function (id) {
        const response = await api.getTop5ListById(id);
        if (response.status === 200) {
            console.log(store.currentlyOpenedLists);

            let response1 = await api.getTop5ListById(id);
            if (response1.status === 200) {
                response1.data.top5List.views += 1;
                console.log(response1.data.top5List);
                let response = await api.updateTop5ListById(id, response1.data.top5List);
                if (response.status === 200) {
                    console.log("UPDATED")
                    storeReducer({
                        type: GlobalStoreActionType.SET_OPENED_LISTS,
                        payload: store.currentlyOpenedLists
                    });
                    store.loadIdNamePairs();
                }
            }
            
            store.currentlyOpenedLists.push(response.data.top5List);
            storeReducer({
                type: GlobalStoreActionType.SET_OPENED_LISTS,
                payload: store.currentlyOpenedLists
            });
        }
    }

    store.unAddOpenedList = async function (id) {
        // console.log("UNADD");
        for (let l in store.currentlyOpenedLists) {
            if (store.currentlyOpenedLists[l]._id === id) {
                store.currentlyOpenedLists.splice(l, 1);
                break;
            }
        }
        // console.log(store.currentlyOpenedLists);
    }

    store.savePublish = async function (status) {
        if (status === "save") {
            store.updateCurrentList();
        } else if (status === "publish") {
            store.currentList.isPublished = true;
            store.updateCurrentList();
        }
        store.closeCurrentList();
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING AN ITEM
    store.setIsItemEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE,
            payload: null
        });
    }

    store.loadIdNamePairsBySearch = async function (searchQuery) {
        console.log("RUNNING QUERY: " + searchQuery + " on state " + store.buttonState);
        if (store.buttonState === '0') {
            if (searchQuery === "") {
                store.loadIdNamePairs();
            } else 
            {
                let response = await api.getTop5ListPairsByQuery("home," + searchQuery);
                if (response.status === 200) {
                    let pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
            }
        } else if (store.buttonState === '1') { // ALL LISTS
            if (searchQuery === "" && auth.user.username !== "Guest") {
                let response = await api.getTop5ListPairsByQuery("all," + searchQuery);
                if (response.status === 200) {
                    let pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
            } 
            else 
            {
                let response = await api.getTop5ListPairsByQuery("all," + searchQuery);
                if (response.status === 200) {
                    let pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
            }
        } else if (store.buttonState === '2') { // ALL LIST-SPEC=ISER
            if (searchQuery === "") {
                let response = await api.getTop5ListPairsByQuery("all-user," + searchQuery);
                if (response.status === 200) {
                    let pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
            } 
            else 
            {
                let response = await api.getTop5ListPairsByQuery("all-user," + searchQuery);
                if (response.status === 200) {
                    let pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
            }
        } else if (store.buttonState === '3') {  // COMMUNITY LISTS: TODO
            // store.loadIdNamePairsByQuery({"community": searchQuery});
        }

    }

    store.sortByDateNewest = function() {
        let pairsArray = store.idNamePairs;
        pairsArray.sort((keyPair1, keyPair2) => {
            return keyPair1.createdAt.localeCompare(keyPair2.createdAt, 'en', {ignorePunctuation: true});
        });

        storeReducer({
            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
            payload: pairsArray
        });
    }

    store.sortByDateOldest = function() {
        let pairsArray = store.idNamePairs;
        pairsArray.sort((keyPair1, keyPair2) => {
            return keyPair1.createdAt.localeCompare(keyPair2.createdAt, 'en', {ignorePunctuation: true});
        }).reverse();

        storeReducer({
            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
            payload: pairsArray
        });
    }

    store.sortByViews = function() {
        let pairsArray = store.idNamePairs;
        pairsArray.sort((keyPair1, keyPair2) => {
            return keyPair1.views > keyPair2.views;
        }).reverse();

        storeReducer({
            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
            payload: pairsArray
        });
    }

    store.sortByLikes = function() {
        let pairsArray = store.idNamePairs;
        pairsArray.sort((keyPair1, keyPair2) => {
            return keyPair1.likes.length > keyPair2.likes.length;
        }).reverse();

        storeReducer({
            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
            payload: pairsArray
        });
    }

    store.sortByDislikes = function () {
        let pairsArray = store.idNamePairs;
        pairsArray.sort((keyPair1, keyPair2) => {
            return keyPair1.dislikes.length > keyPair2.dislikes.length;
        }).reverse();

        storeReducer({
            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
            payload: pairsArray
        });
    }

    store.setButtonStateFrom = function (state) {
        storeReducer({
            type: GlobalStoreActionType.SET_BUTTON_STATE,
            payload: state
        });
        console.log("CHanging SET TO: " + state);
    }

    store.clickedLike = async function (id, user) {
        const response = await api.getTop5ListById(id);
        if (response.status === 200) {
            if (!response.data.top5List.likes.includes(user) && !response.data.top5List.dislikes.includes(user))
            {
                response.data.top5List.likes.push(user);
                let response2 = await api.updateTop5ListById(response.data.top5List._id, response.data.top5List);
                if (response2.status === 200) {
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: store.idNamePairs
                    });
                }
            } else if (response.data.top5List.likes.includes(user)) {
                let index = response.data.top5List.likes.indexOf(user);
                response.data.top5List.likes.splice(index, 1);
                let response2 = await api.updateTop5ListById(response.data.top5List._id, response.data.top5List);
                if (response2.status === 200) {
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: store.idNamePairs
                    });
                }
            }
        }
    }

    store.clickedDislike = async function (id, user) {
        const response = await api.getTop5ListById(id);
        if (response.status === 200) {
            if (!response.data.top5List.dislikes.includes(user) && !response.data.top5List.likes.includes(user))
            {
                response.data.top5List.dislikes.push(user);
                let response2 = await api.updateTop5ListById(response.data.top5List._id, response.data.top5List);
                if (response2.status === 200) {

                }
            } else if (response.data.top5List.dislikes.includes(user)) {
                let index = response.data.top5List.dislikes.indexOf(user);
                response.data.top5List.dislikes.splice(index, 1);
                let response2 = await api.updateTop5ListById(response.data.top5List._id, response.data.top5List);
                if (response2.status === 200) {

                }
            }
        }
    }
    
    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };