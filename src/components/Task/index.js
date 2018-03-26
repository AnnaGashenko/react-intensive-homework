// Core
import React, {Component} from 'react';
import { string, func, number } from 'prop-types';

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
        message: string,
        id: string
    }

    state = {
        showPriority: false
    };

    _deleteNote = () => {
        const { deleteNote, id } = this.props;
        deleteNote(id);
    }

    _priorityTask = () => {
        const { id, priorityTask } = this.props;
        this.setState({
            showPriority: this.state.showPriority === false ? true : false
        });
        console.log(this.state.showPriority);
        priorityTask(id, this.state.showPriority);
    }

    render() {
        const { deleteNote, message, priorityTask } = this.props;
        return (
            <li className= {Styles.task}>
                <div>
                    <Checkbox
                        color2 = '#FFF'
                    />
                    <span>{ message }</span>
                </div>
                <div>
                    <Star
                        checked = { this.state.showPriority }
                        onClick = { this._priorityTask } />
                    <Edit />
                    <Delete onClick = { this._deleteNote } />
                </div>
            </li>
        );
    }
}
