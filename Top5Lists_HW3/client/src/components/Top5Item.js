import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    const [draggedTo, setDraggedTo] = useState(false);
    const [ editActive, setEditActive ] = useState(false);

    function handleDragStart(event) {
        event.dataTransfer.setData("item", event.target.id);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
    }

    // HANDLE EDIT-ITEM
    function handleToggleEdit(event) {
        event.stopPropagation();
        toggleEdit(event, true);
    }

    function toggleEdit(event, b) {
        let newActive = !editActive;
        if (newActive) {
            store.setIsItemEditActive(event.target.id.substring("list-".length));
        }
        if (!b) {
            store.setIsItemEditActive(false);
        }
        setEditActive(newActive);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            handleBlur(event);
        }
    }

    function handleBlur(event) {
        // console.log("BLUR in Top5Item.js");
        let id = event.target.id.substring("list-".length);
        let txt = event.target.value;
        // console.log(id);
        store.addUpdateItemTransaction(id, txt);
        toggleEdit(event, false);
    }

    let { index } = props;
    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }
    let cardStatus = false;
    if (store.isItemEditActive) {
        cardStatus = true;
    }
    let listElements = 
        <div
        disabled={cardStatus}
        id={'item-' + (index + 1)}
        className={itemClass}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable={!store.isItemEditActive}
        >
            <input
                disabled={cardStatus}
                type="button"
                id={"edit-item-" + (index + 1)}
                className=".top5-button"
                value={"\u270E"}
                onClick={handleToggleEdit}
            />
            {props.text}
        </div>;

    if (editActive) {
        listElements = 
            <input
                id={'item-' + (index + 1)}
                className="top5-item"
                type="text"
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                defaultValue={props.text}
            />;
    }
    return (listElements);
}

export default Top5Item;