import React from 'react'
import {
  Button,
  Modal,
  Label,
  Icon,
  Input,
  Form,
  Message
} from 'semantic-ui-react'
import dateFormat from 'dateformat'
import Auth from '../auth/Auth'
import { createTodo } from '../api/todos-api'

interface Props {
  auth: Auth
  addTodoLists: any
}

function ModalCreateTodo(props: Props) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [messageErr, setMessageErr] = React.useState('')

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('dueDate', event.target.value)
    setDueDate(event.target.value)
  }

  const onTodoCreate = async () => {
    try {
      const newTodo = await createTodo(props.auth.getIdToken(), {
        name: name,
        dueDate: dueDate
      })
      props.addTodoLists(newTodo)
      setOpen(false)
    } catch (e: any) {
      console.log(e.response.data.message)
      setMessageErr(
        e.response?.data?.message ? e.response.data.message : 'unknow error'
      )
    }
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button as="div" labelPosition="left">
          <Label as="a" basic>
            Create new Task
          </Label>
          <Button icon>
            <Icon name="add" />
          </Button>
        </Button>
      }
    >
      <Modal.Header>Create new Todo</Modal.Header>
      <Message
        error
        header="Create Todo Fail"
        content={messageErr}
        hidden={messageErr === undefined || messageErr === ''}
      />
      <Modal.Content>
        <Form>
          <Form.Field>
            <Label>Todo name: </Label>
            <Input
              placeholder="input todo task name"
              onChange={handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <Input
              type="date"
              placeholder="input deadline"
              onChange={handleDueDateChange}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setOpen(false)}>
          Close
        </Button>
        <Button
          content="Create"
          labelPosition="right"
          icon="checkmark"
          onClick={() => onTodoCreate()}
          positive
        />
      </Modal.Actions>
    </Modal>
  )
}

export default ModalCreateTodo
