import { getTodoManagerServiceInstance } from "../services/TodoManagerService.js";

const { WebcController } = WebCardinal.controllers;

const ITEMS_PER_PAGE = 3;

export default class TodoListController extends WebcController {
    constructor(...props) {
        super(...props);
        getTodoManagerServiceInstance(this, (todoService) => {
            this.TodoManagerService = todoService;
            // Populate existing todos to item list
            this.populateItemList((err, data) => {
                if (err) {
                    return this._handleError(err);
                } else {
                    this.setItemsClean(data);
                }
                // Init the listeners to handle events
                setTimeout(this.initListeners, 100);
            });
        });

        // Set some default values for the view model
        this.model = {
            items: [],
            item: {
                id: 'item',
                name: 'item',
                value: '',
                placeholder: 'Type your item here'
            },
            descriptionFilter: {
                id: 'description-filter',
                name: 'description-filter',
                value: '',
                placeholder: 'Search for items',
                title: 'Type in an item'
            },
            checkedCheckboxFilter: {
                name: 'checked',
                value: 'checked',
                checked: true
            },
            uncheckedCheckboxFilter: {
                name: 'unchecked',
                value: 'unchecked',
                checked: true
            },
            sort: {
                name: 'description_asc',
                value: 'description_asc'
            },
            pagination: {
                currentPage: 1
            },
            'no-data': 'There are no TODOs'
        };
    }

    initListeners = () => {
        // Select the creating field and add
        // focusout event listener
        // This is used for creating new todo elements
        const todoCreatorElement = this.getElementByTag('create-todo');
        if (todoCreatorElement) {
            todoCreatorElement.addEventListener("focusout", this._mainInputBlurHandler);
        }

        // Selecting the parent of all the items and add the event listeners
        const itemsElement = this.getElementByTag('items');
        if (itemsElement) {
            itemsElement.addEventListener("focusout", this._blurHandler);
            itemsElement.addEventListener("click", this._clickHandler);
            itemsElement.addEventListener("dblclick", this._doubleClickHandler);
        }

        const descriptionFilterElement = this.getElementByTag('description-filter-todos');
        if (descriptionFilterElement) {
            descriptionFilterElement.addEventListener("keyup", this._displayUpdatedItems);
        }

        const checkedFilterElement = this.getElementByTag('checked-filter-todos');
        if (checkedFilterElement) {
            checkedFilterElement.addEventListener("change", this._displayUpdatedItems);
        }

        const uncheckedFilterElement = this.getElementByTag('unchecked-filter-todos');
        if (uncheckedFilterElement) {
            uncheckedFilterElement.addEventListener("change", this._displayUpdatedItems);
        }

        const sortingElement = this.getElementByTag('sort-todos');
        if (sortingElement) {
            sortingElement.addEventListener("click", this._displayUpdatedItems);
        }
    }

    populateItemList(callback) {
        this.TodoManagerService.listToDos(callback);
    }

    displayItems() {
        this.populateItemList((err, data) => {
            if (err) {
                return this._handleError(err);
            } else {
                this.setItemsClean(data);
            }
        });
    }

    _addNewListItem() {
        let fieldIdentifier = this._createUUID();

        let newItem = {
            checkbox: {
                name: 'todo-checkbox-' + fieldIdentifier,
                checked: false
            },
            input: {
                name: 'todo-input-' + fieldIdentifier,
                value: this.model.item.value,
                readOnly: true
            },
            removeButton: {
                name: 'todo-remove-button-' + fieldIdentifier
            },
            creationDate: new Date().toUTCString()
        };

        this.TodoManagerService.createToDo(newItem, (err, data) => {
            if (err) {
                return this._handleError(err);
            }

            // Clear the "item" view model
            this.model.item.value = '';

            this.displayItems();
        });
    }

    stringIsBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    _mainInputBlurHandler = (event) => {
        // We shouldn't add a blank element in the list
        if (!this.stringIsBlank(event.target.value)) {
            this._addNewListItem();
        }
    }

    _blurHandler = (event) => {
        // Change the readOnly property to true and save the changes of the field
        let currentToDo = this.changeReadOnlyPropertyFromEventItem(event, true);
        this.editListItem(currentToDo);
    }

    _clickHandler = (event) => {
        const elementName = event.target.name;
        if (!elementName) {
            return;
        }

        if (elementName.includes('todo-checkbox')) {
            this._changeToDoCheckedState(elementName);
        } else if (elementName.includes("todo-remove-button")) {
            this._removeTodo(elementName);
        }
    }

    _doubleClickHandler = (event) => {
        // Change the readOnly property in false, so we can edit the field
        this.changeReadOnlyPropertyFromEventItem(event, false);
    }

    _displayUpdatedItems = (event) => {
        this.model.pagination.currentPage = 1;
        this.displayItems();
    }

    changeReadOnlyPropertyFromEventItem = (event, readOnly) => {
        let elementName = event.target.name;
        if (!elementName || !elementName.includes('todo-input')) {
            return;
        }

        let items = this.model.items;
        let itemIndex = items.findIndex((todo) => todo.input.name === elementName);
        items[itemIndex].input = {
            ...items[itemIndex].input,
            readOnly: readOnly
        };

        this.model.items = items;
        return items[itemIndex];
    }

    _changeToDoCheckedState = (elementName) => {
        // Find the wanted element and change the value of the checked property
        let items = this.model.items;
        let itemIndex = items.findIndex((todo) => todo.checkbox.name === elementName);
        items[itemIndex].checkbox = {
            ...items[itemIndex].checkbox,
            checked: !items[itemIndex].checkbox.checked,
        }

        this.editListItem(items[itemIndex]);
    }

    _removeTodo(elementName) {
        let items = this.model.items;
        let itemToRemoveIndex = items.findIndex((todo) => todo.removeButton.name === elementName);
        this.removeListItem(items[itemToRemoveIndex]);
    }

    todoIsValid(todo) {
        // Check if the todo element is valid or not
        return !(!todo || !todo.input || !todo.checkbox);
    }

    editListItem(todo) {
        if (!this.todoIsValid(todo)) {
            return;
        }
        this.TodoManagerService.editToDo(todo, (err, data) => {
            if (err) {
                return this._handleError(err);
            } else {
                this.displayItems();
            }
        });
    }

    removeListItem(todo) {
        this.TodoManagerService.removeToDo(todo, (err) => {
            if (err) {
                return this._handleError(err);
            } else {
                if (this.model.items.length === 1) {
                    this.model.pagination.currentPage = 1;
                }
                this.displayItems();
            }
        });
    }

    setItemsClean = (newItems) => {
        if (newItems) {
            let items = this.getFilteredItems(JSON.parse(JSON.stringify(newItems)));
            this.displayPaginationComponent(Math.ceil(items.length / ITEMS_PER_PAGE));
            this.model.items = this.getPaginatedItems(items);
        } else {
            this.model.items = [];
        }
    }

    getFilteredItems = (items) => {
        let descriptionFilterValue = this.model.descriptionFilter.value;
        if (descriptionFilterValue !== '') {
            items = items.filter(item =>
                item.input.value.toLowerCase().includes(descriptionFilterValue.toLowerCase()) // case-insensitive filtering
            );
        }

        const checkedCheckboxFilterValue = this.model.checkedCheckboxFilter.checked;
        if (!checkedCheckboxFilterValue) {
            items = items.filter(item => !item.checkbox.checked);
        }

        const uncheckedCheckboxFilterValue = this.model.uncheckedCheckboxFilter.checked;
        if (!uncheckedCheckboxFilterValue) {
            items = items.filter(item => item.checkbox.checked);
        }

        const dropdownSortingValue = this.model.sort.value;
        if (dropdownSortingValue === "description_asc") {
            items = items.sort((firstItem, secondItem) => firstItem.input.value.toLowerCase().localeCompare(secondItem.input.value.toLowerCase()));
        } else if (dropdownSortingValue === "description_desc") {
            items = items.sort((firstItem, secondItem) => -1 * firstItem.input.value.toLowerCase().localeCompare(secondItem.input.value.toLowerCase()));
        } else if (dropdownSortingValue === "creation_asc") {
            items = items.sort((firstItem, secondItem) => new Date(firstItem.creationDate) - new Date(secondItem.creationDate));
        } else if (dropdownSortingValue === "creation_desc") {
            items = items.sort((firstItem, secondItem) => -1 * (new Date(firstItem.creationDate) - new Date(secondItem.creationDate)));
        }

        return items;
    }

    displayPaginationComponent = (numberOfPages) => {
        const paginationElement = document.getElementById("pagination");
        paginationElement.innerHTML = "";

        if (numberOfPages > 0) {
            for (let i = 1; i <= numberOfPages; ++i) {
                const pageButton = this._createPaginationButton(i);
                paginationElement.appendChild(pageButton);
            }
        }
    }

    _createPaginationButton = (page) => {
        let button = document.createElement("button");
        button.innerText = page;

        if (this.model.pagination.currentPage === page) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            this.model.pagination.currentPage = page;
            this.displayItems();
        });

        return button;
    }

    getPaginatedItems = (items) => {
        const start = ITEMS_PER_PAGE * (this.model.pagination.currentPage - 1);
        const end = start + ITEMS_PER_PAGE;

        return items.slice(start, end);
    }

    _handleError = (err) => {
        const message = "Caught this:" + err.message + ". Do you want to try again?"
        this.showErrorModal(
            message,
            'Oh no, an error..',
            () => {
                console.log("Let's try a refresh");
                window.location.reload();
            },
            () => {
                console.log('You choose not to refresh! Good luck...');
            },
            {
                disableExpanding: true,
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
                id: 'error-modal'
            }
        );
    }

    _createUUID = () => {
        let currentDateTime = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (currentDateTime + Math.random() * 16) % 16 | 0;
            currentDateTime = Math.floor(currentDateTime / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}
