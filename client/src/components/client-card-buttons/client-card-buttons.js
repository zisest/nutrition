import React, { useState } from 'react'
import {useSprings, useTransition, animated} from 'react-spring'

import './client-card-buttons.css'
import SimpleButton from '../simple-button'
import MultiButton from '../multi-button'
import { ReactComponent as GoBackIcon } from '../../assets/go-back-arrow.svg'
import { ReactComponent as TrashcanIcon } from '../../assets/trashcan.svg'
  
function ClientCardButtons({ onEditStart, onSave, onEditCancel, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Handling state
  const handleEditStart = () => {
    setIsEditing(true)
    onEditStart()
  }
  const handleSave = () => {
    setIsEditing(false)
    onSave()
    console.log('Saved')
  }
  const handleEditCancel = () => {
    setIsEditing(false)
    onEditCancel()
  }  

  const handleDeleteStart = () => {
    setIsDeleting(true)
  }
  const handleDelete = () => {
    setIsDeleting(false)
    setIsEditing(false)
    onDelete()
    console.log('Deleted')
  }
  const handleDeleteCancel = () => {
    setIsDeleting(false)
  }

  
  let stateString = isDeleting ? 'deleting' : isEditing ? 'editing': 'initial'

   // Animating width changes  
  const states = {
    initial: [
      {
        width: '136px'
      },
      {
        width: '136px'
      }
    ],
    editing: [
      {
        width: '227px'
      },
      {
        width: '45px'
      }
    ],
    deleting: [
      {
        width: '45px'
      },
      {
        width: '227px'
      }
    ]
  }
 
  const [springs, set, stop] = useSprings(2, index => states.initial[index])
  set(index => states[stateString][index])

  // Animating content changes
  const editVariants = {
    initial: ({ style }) => <animated.div className='client-card-buttons_animated-div' style={{ ...style }}>
      <SimpleButton onClick={handleEditStart} color='faint-grey'>Изменить</SimpleButton>
    </animated.div>,
    editing: ({ style }) => <animated.div className='client-card-buttons_animated-div' style={{ ...style }}>
      <MultiButton color='faint-grey'>
        <SimpleButton onClick={handleEditCancel} isIcon color='faint-grey' withFlatSide='right'><GoBackIcon /></SimpleButton>
        <SimpleButton onClick={handleSave} color='faint-grey' withFlatSide='left'>Сохранить</SimpleButton>
      </MultiButton> 
    </animated.div>,
    deleting: ({ style }) => <animated.div className='client-card-buttons_animated-div' style={{ ...style }}>
      <SimpleButton onClick={handleDeleteCancel} isIcon color='faint-grey'><GoBackIcon /></SimpleButton>
    </animated.div>,
  }

  const deleteVariants = {
    initial: ({ style }) => <animated.div className='client-card-buttons_animated-div' style={{ ...style }}>
      <SimpleButton onClick={handleDeleteStart} color='faint-red'>Удалить</SimpleButton>
    </animated.div>,
    editing: ({ style }) => <animated.div className='client-card-buttons_animated-div client-card-buttons_align-right' style={{ ...style }}>
      <SimpleButton onClick={handleDeleteStart} isIcon color='faint-red'><TrashcanIcon /></SimpleButton>
    </animated.div>,
    deleting: ({ style }) => <animated.div className='client-card-buttons_animated-div' style={{ ...style }}>
      <MultiButton color='red' className='client-card-buttons_align-right'>
        Удалить клиента?
        <SimpleButton onClick={handleDelete} isIcon color='red' withFlatSide='left'><TrashcanIcon /></SimpleButton>
      </MultiButton>
    </animated.div>,
  }

  const transitions = useTransition(stateString, p => p, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })
  
  return (
    <div className='client-card-buttons'>
      <animated.div style={springs[0]}>
      {transitions.map(({ item, props, key }) => {
        const Edit = editVariants[item]
        return <Edit key={key} style={props} />
      })}
      </animated.div>
      <animated.div style={springs[1]}>
      {transitions.map(({ item, props, key }) => {
        const Delete = deleteVariants[item]
        return <Delete key={key} style={props} />
      })}
      </animated.div>
    </div>
  )
}
ClientCardButtons.defaultProps = { }
  
export default ClientCardButtons
