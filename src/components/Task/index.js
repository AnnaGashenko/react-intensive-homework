// Core
import React, {Component} from 'react';
import { string, func, bool } from 'prop-types';

// Instruments
import Styles from './styles.scss';

// Components
import Checkbox  from '../../theme/assets/Checkbox.js';
import Star  from '../../theme/assets/Star.js';
import Edit  from '../../theme/assets/Edit.js';
import Delete  from '../../theme/assets/Delete.js';

export class Task extends Component {
    static propTypes = {
        deleteNote: func,
        priorityTask: func,
        handleCheckOneTask: func,
        editTask: func,
        message: string,
        id: string,
        favorite: bool,
        completed: bool
    }

    state = {
        comment: this.props.message,
        editTask: false
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.favorite !== this.props.favorite
        || nextProps.completed !== this.props.completed ? true : false
        || nextState.comment !== this.props.comment
        || nextProps.message !== this.props.message;
    }

    _priorityTask = () => {
        const { priorityTask, id } = this.props;
        priorityTask(id);
    }

    _checkOneTask = () => {
        const { handleCheckOneTask, id } = this.props;
        handleCheckOneTask(id);
    }

    _deleteNote = () => {
        const { deleteNote, id } = this.props;
        deleteNote(id);
    }

    _handleInputChange = ({ target: { value }}) => {
        this.setState({
            comment: value
        });
    }

    _editTask = (event) => {
        const { editTask, comment } = this.state;
        const { completed } = this.props;
        if(!completed) {
            this.setState({
                editTask: !editTask
            })
            if(editTask === true) {
                const { editTask, id } = this.props;
                editTask(id, comment);
            }
        }
    }

    _handleKeyPress = (event) => {
        if(event.keyCode === 27) {
            this.setState({
                editTask: false,
                comment: this.props.message
            })
        }
    }

    render() {
        const { deleteNote, message, favorite, completed } = this.props;

        const editTask = () => {
            return this.state.editTask
                ?   <input
                        value= { this.state.comment }
                        type="text"
                        onChange = { this._handleInputChange }
                    />
                : <span>{ message }</span>;
        }
        return (
            <li className= {Styles.task}>
                <div>
                    <Checkbox
                        color2 = '#FFF'
                        checked = { completed }
                        onClick = { this._checkOneTask }
                    />
                    {
                        this.state.editTask
                        ?   <input
                                value= { this.state.comment }
                                type="text"
                                maxLength="46"
                                onChange = { this._handleInputChange }
                                onKeyDown = { this._handleKeyPress }
                                autoFocus
                            />
                        : <span>{ message }</span>
                    }
                </div>
                <div>
                    <Star
                        checked = { favorite }
                        onClick = { this._priorityTask }
                    />
                    <Edit
                        checked = { this.state.editTask }
                        onClick = { this._editTask }
                    />
                    <Delete onClick = { this._deleteNote } />
                </div>
            </li>
        );
    }
}
