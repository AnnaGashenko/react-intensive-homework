// Core
import React, {Component} from 'react';
import { string, func } from 'prop-types';

// Instruments
import Styles from './styles.scss';

// Components
import { Task } from 'components/Task';
import Checkbox  from '../../theme/assets/Checkbox.js';

export class Scheduler extends Component {
    constructor () {
        super();

        this.handleSubmit = this._handleSubmit.bind(this);
        this.handleInputChange = this._handleInputChange.bind(this);
        this.getNote = this._getNote.bind(this);
        this.createNote = this._createNote.bind(this);
        this.deleteNote = this._deleteNote.bind(this);
        this.priorityTask = this._priorityTask.bind(this);

    }

    static contextTypes = {
        api:       string.isRequired,
        token:     string.isRequired
    }

    // устанавливаем состояние по дефолту
    state = {
        comment: '',
        notes: [],
        valueSearch : ''
    }

    componentDidMount() {
        this.getNote();
    }

    // при вводе в поле сообщения устанавливаем новое состояние компонента через setState
    _handleInputChange = ({ target: { value }}) => {
        if(value.length > 46 ) {
            console.log('Too much message');
        }
        this.setState({
            comment: value
        });
    }

    // при отправке сообщение (после нажатия кнопки отправить)
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

    // проверить что пришло из прошлого состояния console.log(prevState);
    _createNote = (message) => {
        const {api, token} = this.context;
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : token
            },
            body: JSON.stringify({ message }) // {"comment" : "message from textarea"}
        }).then ((response) => {
            if (response.status !== 200) {
                throw new Error('create note error');
            }
            // (prevState, props)
            // this.setState(({ notes }) => ({
            //     notes: [...notes]
            // }));
            return response.json();
        })
        .then(({ data }) => {
            this.setState(({ notes }) => ({
                notes: [data, ...notes] // к текущим заметкам
            }))
        })
        .catch((error) => {
            console.log(error.message);
        });

    }

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

    _priorityTask = async (id, showPriority) => {
        // из всех заметок достать только ту, у которой id совпадает
        const { notes: notesData } = this.state;
        console.log(showPriority);
        const notes = notesData.filter((note) => note.id === id);
        const {api, token} = this.context;
        fetch(api, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : token
            },
            body: JSON.stringify(notes.map((note) => ({"message": note.message, "id": id, "completed":false, "favorite":true})))
        }).then ((response) => {
            // console.log(response);
            if (response.status !== 200) {
                throw new Error('not priorityTaks');
            }
            return response.json();
        }).then(({ data }) => {
           console.log(data);
        }).catch((error) => {
            console.log(error.message);
        });
    }

    _handleSearch = ({ target: { value }}) => {
        this.setState({
            valueSearch: value
        });

        // const { notes } = this.state;
        // const displayTasks = notes.filter((note) => {
        //     const searchValue = note.message;
        //     console.log(searchValue);
        //     return searchValue.indexOf(value) !== -1;
        // });
        // console.log(displayTasks);
        // this.setState({
        //     notes: displayTasks
        // });
        // console.log(this.state.notes);
    }

    render() {
        const { notes: noteData, comment, valueSearch } = this.state;
        const filteredTasks = noteData.filter((note) =>
            note.message.includes(valueSearch)).map((note) =>
                <Task
                    id = { note.id }
                    key = { note.id }
                    message = { note.message }
                    completed = { note.completed }
                    favorite = { note.favorite }
                    deleteNote = { this.deleteNote } // отправляем функцию в дочерний компонент
                    priorityTask = { this._priorityTask }
                />
        );

        return (
            <section className= {Styles.scheduler}>
                <main>
                    <header>
                        <h1>Планировщик задач</h1>
                        <input
                            onChange = { this._handleSearch }
                        />
                    </header>
                    <section>
                        <form onSubmit = { this.handleSubmit }>
                            <input
                                value = { comment }
                                onChange = { this.handleInputChange }
                            />
                            <button type="submit" disabled={ !comment }>Добавить задачу</button>
                        </form>
                        <ul>
                            { filteredTasks }
                        </ul>
                    </section>
                    <footer>
                        <span>
                            <Checkbox
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
