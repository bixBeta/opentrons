// @flow
import * as React from 'react'
import {connect} from 'react-redux'
import {FormGroup, InputField} from '@opentrons/components'
import { getLabware } from '@opentrons/shared-data'
import {selectors as labwareIngredsSelectors} from '../../../labware-ingred/reducers'
import i18n from '../../../localization'
import {selectors} from '../../../steplist'
import styles from './TipPositionInput.css'
import TipPositionModal from './TipPositionModal'
import type {BaseState} from '../../../types'

type OP = {prefix?: 'aspirate' | 'dispense'}
type SP = {
  tipPosition: ?string,
  wellHeightMM: ?number
}

type TipPositionInputState = {isModalOpen: boolean}
class TipPositionInput extends React.Component<OP & SP, TipPositionInputState> {
  state: TipPositionInputState = {isModalOpen: false}

  handleOpen = () => {
    if (this.props.wellHeightMM) {
      this.setState({isModalOpen: true})
    }
  }
  handleClose = () => { this.setState({isModalOpen: false}) }

  render () {
    return (
      <FormGroup
        label={i18n.t('step_edit_form.field.tip_position.label')}
        disabled={!this.props.wellHeightMM}
        className={styles.well_order_input}>
        <TipPositionModal
          prefix={this.props.prefix}
          closeModal={this.handleClose}
          wellHeightMM={this.props.wellHeightMM}
          tipPosition={this.props.tipPosition}
          isOpen={this.state.isModalOpen} />
          <InputField
            readOnly
            onClick={this.handleOpen}
            value={this.props.wellHeightMM ? this.props.tipPosition : null}
            units="mm" />
      </FormGroup>
    )
  }
}
const mapSTP = (state: BaseState, ownProps: OP): SP => {
  const formData = selectors.getUnsavedForm(state)
  // NOTE: not interpolating prefix because breaks flow string enum
  let fieldName = 'tipPosition'
  if (ownProps.prefix === 'aspirate') fieldName = 'aspirate_tipPosition'
  else if (ownProps.prefix === 'dispense') fieldName = 'dispense_tipPosition'

  let labwareFieldName = 'labware'
  if (ownProps.prefix === 'aspirate') labwareFieldName = 'aspirate_labware'
  else if (ownProps.prefix === 'dispense') labwareFieldName = 'dispense_labware'

  let wellHeightMM = null
  if (formData && formData[labwareFieldName]) {
    const labwareById = labwareIngredsSelectors.getLabware(state)
    const labwareDef = getLabware(labwareById[formData[labwareFieldName]].type)
    if (labwareDef) {
      // NOTE: only taking depth of first well in labware def, UI not currently equipped for multiple depths
      const firstWell = labwareDef.wells[Object.keys(labwareDef.wells)[0]]
      if (firstWell) wellHeightMM = firstWell.depth
    } else {
      console.warn('the specified source labware definition could not be located')
    }
  }
  return {
    wellHeightMM,
    tipPosition: formData && formData[fieldName]
  }
}

export default connect(mapSTP)(TipPositionInput)
