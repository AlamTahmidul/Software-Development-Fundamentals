import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import ChangeList_Transaction from "./transactions/ChangeList_Transaction.js"

/**
 * Top5Model.js
 * 
 * This class provides access to all the data, meaning all of the lists. 
 * 
 * This class provides methods for changing data as well as access
 * to all the lists data.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Model {
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.top5Lists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;
    }

    getList(index) {
        return this.top5Lists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    setView(initView) {
        this.view = initView;
    }

    addNewList(initName, initItems) {
        let newList = new Top5List(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initItems)
            newList.setItems(initItems);
        this.top5Lists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        return newList;
    }

    sortLists() {
        this.top5Lists.sort((listA, listB) => {
            if (listA != null && listB != null)
            {
                // console.log("" + listA.getName() + " => " + listB.getName());
                if (listA.getName() < listB.getName()) {
                    return -1;
                }
                else if (listA.getName() === listB.getName()) {
                    return 0;
                }
                else {
                    return 1;
                }
            }    
        });
        this.view.refreshLists(this.top5Lists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            this.view.unhighlightList(i);
        }
    }

    loadList(id) {
        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.update(this.currentList);
                this.view.highlightList(i);
                found = true;
            }
            i++;
        }
        this.tps.clearAllTransactions();
        this.view.updateToolbarButtons(this);
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.top5Lists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                if (listData != null) {
                    let items = [];
                    for (let j = 0; j < listData.items.length; j++) {
                        items[j] = listData.items[j];
                    }
                    this.addNewList(listData.name, items);
                }
            }
            this.sortLists();   
            this.view.refreshLists(this.top5Lists);
            return true;
        }        
    }

    highlightListByName(name) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            if (this.top5Lists[i].name == name && this.top5Lists[i].id == i) {
                // console.log(this.top5Lists[i]);
                this.view.update(this.top5Lists[i]);
                this.view.highlightList(i);
                break;
            }
        }
    }

    saveLists() {
        let top5ListsString = JSON.stringify(this.top5Lists);
        localStorage.setItem("recent_work", top5ListsString);
    }

    deleteList(name) {
        let jsonParser = JSON.parse(localStorage.getItem("recent_work"));
        for (let i in jsonParser) {
            if (jsonParser[i].name == name) {
                // console.log("Deleted " + jsonParser[i].name);
                jsonParser.splice(i, 1);
                break;
            }
        }
        this.top5Lists = jsonParser; // New List is without the element
        // console.log(jsonParser);
        localStorage.clear();
        this.saveLists();
        this.loadLists();
        this.closeList();
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    refreshList() {
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
    }

    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.items[id];
        // console.log(this.currentList);
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
    }

    changeItem(id, text) {
        this.currentList.items[id] = text;
        this.view.update(this.currentList);
        this.saveLists();
    }

    addChangeListTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.name;
        let transaction = new ChangeList_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
    }

    changeList(id, text) {
        // console.log(this.currentList.name);
        this.currentList.name = text;
        // console.log(this.currentList.name);
        this.view.update(this.currentList);
        this.saveLists();
    }

    // SIMPLE UNDO/REDO FUNCTIONS
    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() { // TODO
        if (this.tps.hasTransactionToRedo()) {
            this.tps.redoTransaction(); // TODO
            this.view.updateToolbarButtons(this); // TODO
        }
    }

    clearTransactions() {
        this.tps.clearAllTransactions();
        this.view.updateToolbarButtons(this);
    }

    closeList() {
        this.unselectAll(); // UNSELECT LISTS

        // Clear INNER HTML for lists
        for (let i = 1; i <= 5; i++) {
            document.getElementById("item-" + i).innerText = "";
        }
        // Clear Status Bar
        document.getElementById("top5-statusbar").innerText = "";

        // CLOSE BUTTON DISABLED WHEN LIST IS NOT BEING EDITED
        document.getElementById("close-button").classList.add("disabled");

        // Remove Restriction on Add-List
        document.getElementById("add-list-button").classList.remove("disabled");

        // CLEAR TRANSACTION STACK
        this.clearTransactions();
    }

    printTPS() {
        console.log(this.tps.toString());
    }
}