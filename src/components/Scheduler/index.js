// Core
import React, {Component} from 'react';
import { string, func } from 'prop-types';
import FlipMove from 'react-flip-move';

// Instruments
import Styles from './styles.scss';

// Components
import { Task } from 'components/Task';
import Checkbox  from '../../theme/assets/Checkbox.js';

export class Scheduler extends Component {
    static contextTypes = {
        api:       string.isRequired,
        token:     string.isRequired
    }

    constructor () {
        super();

        this.handleSubmit = this._handleSubmit.bind(this);
        this.handleInputChange = this._handleInputChange.bind(this);
        this.getNote = this._getNote.bind(this);
        this.createNote = this._createNote.bind(this);
        this.deleteNote = this._deleteNote.bind(this);
        this.priorityTask = this._priorityTask.bind(this);
        this.handleCheckCompleted = this._handleCheckCompleted.bind(this);
        this.saveToLocalStorage = this._saveToLocalStorage.bind(this);
        this.editTask = this._editTask.bind(this);
    }

    state = {
        comment: '',
        notes: [],
        valueSearch : '',
        showCompleted : false,
        infoBlock : false
    }

    componentDidMount() {
        this.getNote();
        /**
         * Get data from localStorage
         */
        const savedCheckbox = JSON.parse(localStorage.getItem('showCompleted'));
        if (savedCheckbox) {
            this.setState({
                showCompleted: savedCheckbox
            });
        }
    }

    /**
     * update all tasks when checkbox "All tasks done" checked
     * @returns {Promise.<void>}
     * @private
     */
    _handleCheckCompleted = async () => {
        const {api, token} = this.context;
        try {
            const response = await fetch(api, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : token
                },
                body: JSON.stringify(this.state.notes
                    .map((note) => (
                        {
                            "message": note.message,
                            "id": note.id,
                            "completed": !this.state.showCompleted,
                            "favorite": note.favorite
                        }
                    )))
            });

            if (response.status !== 200) {
                throw new Error('fetch check failed');
            }
            const { data } = await response.json();
            this.setState((prevState) => ({
                notes: data,
                showCompleted: !prevState.showCompleted
            }), this.saveToLocalStorage);
        } catch ({ message }) {
            console.log(message);
        }
    }
    /**
     * update data with selected task of "completed"
     * @param id
     * @returns {Promise.<void>}
     * @private
     */
    _handleCheckOneTask = async (id) => {
        const {api, token} = this.context;
        try {
            const response = await fetch(api, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : token
                },
                body: JSON.stringify(this.state.notes
                    .filter((note) => note.id === id)
                    .map((note) => (
                        {
                            "message": note.message,
                            "id": id,
                            "completed": !note.completed,
                            "favorite": note.favorite
                        }
                    )))
            });
            if (response.status !== 200) {
                throw new Error('fetch check failed');
            }
            const { data } = await response.json();
            data.map((item) =>
                this.setState(({ notes }) => ({
                    notes: notes.map((note) => note.id == id ? item : note)
                }))
            );
        } catch ({ message }) {
            console.log(message);
        }
    }

    /**
     * save to LocalStorage data checkbox "All tasks done"
     * @private
     */
    _saveToLocalStorage () {
        const showCompleted = JSON.stringify(this.state.showCompleted);
        localStorage.setItem('showCompleted', showCompleted);
    }

    /**
     * update data with selected task of "favorite"
     * @param id
     * @returns {Promise.<void>}
     * @private
     */
    _priorityTask = async (id) => {
        const {api, token} = this.context;
        fetch(api, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : token
            },
            body: JSON.stringify(this.state.notes
                .filter((note) => note.id === id)
                .map((note) => (
                    {
                        "message": note.message,
                        "id": id,
                        "completed": note.completed,
                        "favorite": !note.favorite
                    }
                )))
        }).then ((response) => {
            if (response.status !== 200) {
                throw new Error('not priorityTaks');
            }
            return response.json();
        }).then(({ data }) => {
            data.map((item) =>
                this.setState(({ notes }) => ({
                    notes: notes.map((note) => note.id == id ? item : note)
                }))
            );
        }).catch((error) => {
            console.log(error.message);
        });
    }

    /**
     * Check length symbols and set state of the entered value
     * @param value
     * @private
     */
    _handleInputChange = ({ target: { value }}) => {
        (value.length >= 46 ) ? this.setState({ infoBlock: true }) : this.setState({ infoBlock: false })

        this.setState({
            comment: value
        });
    }

    /**
     * edit selected task
     * @param id
     * @param message
     * @returns {Promise.<void>}
     * @private
     */
    _editTask = async (id, message) => {
        const {api, token} = this.context;
        fetch(api, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : token
            },
            body: JSON.stringify(this.state.notes
                .filter((note) => note.id === id)
                .map((note) => (
                    {
                        "message": message,
                        "id": id,
                        "completed": note.completed,
                        "favorite": note.favorite
                    }
                )))
        }).then ((response) => {
            if (response.status !== 200) {
                throw new Error('not priorityTaks');
            }
            return response.json();
        }).then(({ data }) => {
            data.map((item) =>
                this.setState(({ notes }) => ({
                    notes: notes.map((note) => note.id == id ? item : note)
                }))
            );
        }).catch((error) => {
            console.log(error.message);
        });
    }

    /**
     * Create new task
     * @param event
     * @private
     */
    _handleSubmit(event) {
        event.preventDefault();
        const { comment } = this.state;

        // проверяем если есть комментарий, в поле что то ввел
        if(comment) {
            // тогда из props переданный из App "createPost = { this._createPost }"
            // передаем в функцию значение comment
            this.createNote(comment);

            this.setState({
                comment: ''
            });
        }
        // если нет коммента то правая стророна выполняется
        //comment && this.props.createPost(this.state.comment); // вызываем функцию

    }

    /**
     * create new task
     * @param message
     * @private
     */
    _createNote = (message) => {
        const {api, token} = this.context;
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : token
            },
            body: JSON.stringify({ message })
        }).then ((response) => {
            if (response.status !== 200) {
                throw new Error('create note error');
            }
            return response.json();
        })
            .then(({ data }) => {
                this.setState(({ notes }) => ({
                    notes: [data, ...notes]
                }))
            })
            .catch((error) => {
                console.log(error.message);
            });
    }

    /**
     * delete current task
     * @param id
     * @private
     */
    _deleteNote = (id) => {
        const {api, token} = this.context;
        fetch(`${api}${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : token
            }
        }).then ((response) => {
            if (response.status !== 204) {
                throw new Error('not delete post');
            }
        }).then(() => {
            this.setState(({ notes }) => ({
                notes: notes.filter((note) => note.id !== id)
            }));
        }).catch((error) => {
            console.log(error.message);
        });

    }

    /**
     * get all Tasks from server
     * @returns {Promise.<void>}
     * @private
     */
    _getNote = async () => {
        const {api, token} = this.context;
        fetch(api, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : token
            }
        }).then ((response) => {
            if (response.status !== 200) {
                throw new Error('not get post');
            }
            return response.json();

        }).then(({ data }) => {
            this.setState(() => ({
                notes: [...data]
            }));
        }).catch((error) => {
            console.log(error.message);
        });
    }

    /**
     * set value from field search
     * @param value
     * @private
     */
    _handleSearch = ({ target: { value }}) => {
        this.setState({
            valueSearch: value
        });
    }

    /**
     * sorting tasks depending on the choice completed or/and favorite
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    _sortingTasks = (a, b) => {
        if (a.completed > b.completed) {
            return 1;
        }
        if (a.completed < b.completed) {
            return -1;
        }
        if (a.favorite < b.favorite) {
            return 1;
        }
        if (a.favorite > b.favorite) {
            return -1;
        }
        return 0;
    }

    render() {
        const { notes: noteData, comment, valueSearch, showCompleted, infoBlock } = this.state;
        const tasks = noteData
            .filter(note => note.message.toLowerCase()
                .includes(valueSearch.toLowerCase())
            )
            .sort(this._sortingTasks)
            .map((note) =>
                <Task
                    id = { note.id }
                    message = { note.message }
                    key = { note.id }
                    completed = { note.completed }
                    favorite = { note.favorite }
                    deleteNote = { this.deleteNote }
                    priorityTask = { this.priorityTask }
                    handleCheckOneTask = { this._handleCheckOneTask }
                    editTask = { this._editTask }
                />
            );
        return (
            <section className = {Styles.scheduler}>
                <main>
                    <header>
                        <h1>Планировщик задач</h1>
                        <input onChange = { this._handleSearch } />
                    </header>
                    <section>

                        <form onSubmit = { this.handleSubmit }>
                            <input
                                value = { comment }
                                onChange = { this.handleInputChange}
                                maxLength = "46"
                            />
                            <button type="submit" disabled={ !comment }>Добавить задачу</button>
                        </form>
                        {
                            infoBlock
                                ? <span className = {Styles.info}>Заметка должна быть длинной не более 46 символов</span>
                                : null
                        }
                        <ul>
                            <FlipMove duration = {750} easing = "ease-out">
                                { tasks }
                            </FlipMove>
                        </ul>

                    </section>
                    <footer>
                        <span>
                            <Checkbox
                                onClick = { this.handleCheckCompleted }
                                checked = { showCompleted }
                                color2 = '#FFF'
                            />
                        </span>
                        <code>Все задачи выполнены</code>
                    </footer>
                </main>
            </section>
        );
    }
}