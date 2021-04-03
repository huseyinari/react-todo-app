import React, { Component } from 'react'
import {Spinner,InputGroup,Form,Row,Col,ListGroup,Button,Badge,Container,Alert} from 'react-bootstrap';
import {DatePicker,Button as AntButton} from 'antd';
import { EditOutlined,DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import apiURL from '../apiURL';

export default class Homepage extends Component {
    state = {
        todos:null,

        newTodo:{
            note:'',
            dueDate:null,
            importance:''
        },
        responseErrors:null,
        errorsVisible:false,

        selectedTodo:null // güncellemek için seçilen todo
    }
    componentDidMount(){
        this.getTodos();
    }
    getTodos = () => {
        const url = apiURL + '/todo';
        axios.get(url)
        .then(response => this.setState({todos:response.data.todos}))
        .catch(err => console.log(err))
    }
    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        let {newTodo} = this.state;
        newTodo[name] = value;
        this.setState({newTodo});
    }
    datePickerChanged = (value) => {
        let {newTodo} = this.state;
        newTodo['dueDate'] = value._d.toISOString();
        this.setState(newTodo);
    }
    saveButtonClicked = () => {
        const url = apiURL + '/todo';
        const {newTodo,selectedTodo} = this.state;
        let {todos} = this.state;

        if(selectedTodo === null){
            axios.post(url,newTodo)
            .then(response => {
                if(response.data.status === true){
                    this.setState({
                        todos:[...this.state.todos,response.data.newTodo],
                        newTodo:{note:'', dueDate:null, importance:''},
                        responseErrors:null,
                        errorsVisible:false
                    });
                    document.getElementById('datePicker').value = null;
                }
                else
                    this.setState({responseErrors:response.data.errors,errorsVisible:true});
            })
            .catch(err => this.setState({responseErrors:{"0" : {message:"Sunucu hatası! Daha sonra tekrar deneyiniz..."}},errorsVisible:true}));
        }else{
            axios.put(url,newTodo)
            .then(response => {
                if(response.data.status === true){
                    const index = todos.findIndex(todo => todo._id === selectedTodo._id);
                    todos[Number(index)] = response.data.todo;
                    this.setState({
                        todos,
                        newTodo:{note:'', dueDate:null, importance:''},
                        responseErrors:null,
                        errorsVisible:false,
                        selectedTodo:null
                    });
                    document.getElementById('datePicker').value = null;
                }
                else
                    this.setState({responseErrors:response.data.errors,errorsVisible:true});
            })
            .catch(err => this.setState({responseErrors:{"0" : {message:"Sunucu hatası! Daha sonra tekrar deneyiniz..."}},errorsVisible:true}));
        }
    }
    clearButtonClicked = () => {
        this.setState({
            selectedTodo:null,
            newTodo:{
                note:'',
                dueDate:null,
                importance:''
            },
            errorsVisible:false,
            responseErrors:null
        });
        document.getElementById('datePicker').value = '';
    }
    editButtonClicked = (todo) => {
        this.setState({
            selectedTodo:todo,
            newTodo:{
                id:todo._id,
                note:todo.note,
                dueDate:todo.dueDate, 
                importance:todo.importance
            }
        });
    }
    deleteButtonClicked = (id) => {
        const url = apiURL + '/todo?id=' + id;
        let {todos} = this.state;

        axios.delete(url)
        .then(response => {
            if(response.data.status === true){
                todos = todos.filter(todo => todo._id !== id);
                this.setState({todos,responseErrors:null,errorsVisible:false});
            }else
                this.setState({responseErrors:response.data.errors,errorsVisible:true});
        })
        .catch(err => this.setState({responseErrors:{"0" : {message:"Sunucu hatası! Daha sonra tekrar deneyiniz..."}},errorsVisible:true}))
    }
    convertDateToTurkish = (isoDate) => {
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const date = isoDate.split('T')[0];
        const splitedDate = date.split('-');
        const trDate = splitedDate[2] + ' ' + months[Number(splitedDate[1]) - 1] + ' ' + splitedDate[0];
        return trDate;
    }
    mapErrors = () => {
        const {responseErrors} = this.state;
        
        if(responseErrors === null)
            return null;
        
        return Object.keys(responseErrors).map(error => (
            <li>{responseErrors[error].message}</li>
        ));
    }
    mapTodos = () => {
        const {todos} = this.state;

        if(todos.length === 0)
            return <p>Henüz not eklenmedi...</p>

        return todos.map(todo => (
            <ListGroup.Item key={todo._id} variant={todo.importance === 'Acil' ? 'warning' : 'light'}>
                <div className="row">
                    <div className="col-md-7">
                        {todo.note}
                    </div>
                    <div className="col-md-2">
                        {" " + this.convertDateToTurkish(todo.dueDate)}
                    </div>
                    <div className="col-md-3">
                        <AntButton type="primary" icon={<EditOutlined />} size={'small'} onClick={() => this.editButtonClicked(todo)}>
                            Düzenle
                        </AntButton>
                        <AntButton type="primary" danger style={{marginLeft:5}} size={'small'} icon={<DeleteOutlined />} onClick={() => this.deleteButtonClicked(todo._id)}>Sil</AntButton>
                    </div>
                </div>
                
            </ListGroup.Item>
        ))
    }
    render() {
        const {todos,newTodo,errorsVisible,selectedTodo} = this.state;

        if(todos === null)
            return ( 
                <div style={{height:'100vh',display:'flex',justifyContent:'center',alignItems:'center'}}>
                    <Spinner animation="border" role="status" variant="danger" /> 
                </div>
            )

        return (
            <Container fluid="xl" className="container">
                <Row>
                    <Col>
                        <div className="form-wrapper">
                            <Alert variant="danger" style={{display:errorsVisible ? 'block' : 'none'}}>
                                <Alert.Heading>Hata Oluştu !</Alert.Heading>
                                <ul>
                                    {
                                        this.mapErrors()
                                    }
                                </ul>
                            </Alert>
                            
                            <InputGroup hasValidation className="note">
                                <InputGroup.Prepend>
                                    <InputGroup.Text>Görev</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control type="text" onChange={this.handleChange} name="note" value={newTodo.note}/>
                            </InputGroup>
                            <Form.Control
                                as="select"
                                custom
                                onChange={this.handleChange}
                                name="importance"
                                value={newTodo.importance}
                                className="importance-checkbox"
                            >
                                <option value={''}>Aciliyet Durumu Seçiniz</option>
                                <option value="Acil Değil">Acil Değil</option>
                                <option value="Acil">Acil</option>
                            </Form.Control>
                            <div>
                                <DatePicker id="datePicker" placeholder="Son tarihi seçiniz" onChange={this.datePickerChanged} className="date-picker" allowClear={false} />
                            </div>
                            <div>
                                <Button variant="info" className="save-button" onClick={this.saveButtonClicked}>
                                    {
                                        selectedTodo === null
                                        ? <span>Ekle</span>
                                        : <span>Güncelle</span>
                                    }
                                </Button>
                                <Button variant="secondary" className="clear-button" onClick={this.clearButtonClicked}>Temizle</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className="todos-wrapper">
                    <Col>
                        <Badge variant="warning">Acil</Badge>
                        <Badge variant="light">Acil Değil</Badge>
                        <ListGroup>
                            {
                                this.mapTodos()
                            }
                        </ListGroup>
                    </Col>
                </Row>
            </Container>
        )
    }
}
