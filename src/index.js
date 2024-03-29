import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import '@atlaskit/css-reset'
import styled from 'styled-components'
import {DragDropContext, Droppable} from 'react-beautiful-dnd'

import initialData from './initialData'
import Column from './column'

const Container = styled.div`
  display: flex;
`

class InnerList extends React.PureComponent{
  render(){
    const {column, taskMap, index, isDropDisabled} = this.props
    const tasks = column.taskIds.map(taskId=>taskMap[taskId])
    return <Column column={column} tasks={tasks} index={index} isDropDisabled={isDropDisabled}/>
  }
}

class App extends React.Component{
  state = initialData

  onDragStart = start=>{
    const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId)

    this.setState({
      homeIndex 
    })
  }

  onDragEnd = result=>{

    this.setState({
      homeIndex: null
    })

    const {destination, source, draggableId, type} = result

    if(!destination){
      return
    }

    if(
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ){
      return
    }

    if(type==='column'){
      const newColumnOrder = Array.from(this.state.columnOrder)
      newColumnOrder.splice(source.index,1)
      newColumnOrder.splice(destination.index, 0, draggableId)
      
      const newState = {
        ...this.state,
        columnOrder: newColumnOrder
      }

      this.setState(newState)
      return
    }

    const start = this.state.columns[source.droppableId]
    const finish = this.state.columns[destination.droppableId]

    if(start===finish){
      const newTaskIds = Array.from(start.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)
  
      const newColumn = {
        ...start,
        taskIds: newTaskIds
      }
  
      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn
        }
      }
  
      this.setState(newState)
      return
    }

    const startTaskIds = Array.from(start.taskIds)
    startTaskIds.splice(source.index, 1)
    const newStart = {
      ...start,
      taskIds: startTaskIds
    }

    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0 ,draggableId)
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds
    }

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    }

    this.setState(newState)

  }

  render(){
    return (
      <DragDropContext 
        onDragStart={this.onDragStart} 
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId='all-columns'
          direction='horizontal'
          type='column'
        >
          {(provided)=>(
            <Container
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {this.state.columnOrder.map((columnId, index)=>{
                const column = this.state.columns[columnId]

                const isDropDisabled = index < this.state.homeIndex

                return( 
                  <InnerList
                    key={column.id} 
                    column={column} 
                    taskMap={this.state.tasks} 
                    isDropDisabled={isDropDisabled}
                    index={index}
                  />
                )
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    )
  }

}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
