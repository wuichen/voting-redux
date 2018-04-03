import React from 'react';
import toJson, { mountToJson } from 'enzyme-to-json';
import { asyncFlush, click, setValue, fillInput, getInput, clickButton, submitButton } from '../../../utils/__test__/test.helper';
// Import components
import NewPollPopup from '../popup-new-poll';

// ENZ UPDATE:
// ENZYME support for REACT 16 not complete. (re: rerender on prop changes)
// https://github.com/airbnb/enzyme/issues/1229
// https://github.com/airbnb/enzyme/issues/1553

const mockFn = jest.fn();
const cmpntProps = {
  newPollPopupOpen: true,
  reset: mockFn,
  closeNewPollPopup: mockFn,
  handleSubmit: mockFn
};


describe('<NewPollPopup />', () => {
  let wrapper, store,
    resetSpy, closeNewPollPopupSpy, handleSubmitSpy;

  beforeAll(async () => {
    resetSpy = jest.spyOn(cmpntProps, 'reset');
    closeNewPollPopupSpy = jest.spyOn(cmpntProps, 'closeNewPollPopup');
    handleSubmitSpy = jest.spyOn(cmpntProps, 'handleSubmit');
    wrapper = mountConnected(<NewPollPopup {...cmpntProps} />);
    store = wrapper.instance().store;
    jest.restoreAllMocks();
    await asyncFlush();
  });

  it('renders properly', async () => {
    const cmpnt = wrapper.find('NewPollPopup');
    expect(cmpnt).toBeDefined();
    expect(cmpnt.prop('newPollPopupOpen')).toBe(true);
    expect(cmpnt.prop('closeNewPollPopup')).toBeDefined();
    expect(cmpnt.instance().handleClosePopup).toBeDefined();
    expect(cmpnt.prop('invalid')).toBe(false);
    expect(cmpnt.prop('pristine')).toBe(true);
    expect(cmpnt.prop('submitting')).toBe(false);
    expect(cmpnt.prop('reset')).toBeDefined();
    expect(store.getActions()).toEqual([
      {
      //   type: '@@redux-form/INITIALIZE',
      //   meta: { form: 'newPoll',
      //     keepDirty: false,
      //     updateUnregisteredFields: false },
      //   payload: { title: '', choices: '' }
      // }, {
        type: '@@redux-form/UPDATE_SYNC_ERRORS',
        meta: { form: 'newPoll' },
        payload: { error: undefined, syncErrors: { choices: '* Required', title: '* Required' }}
      }, {
        type: '@@redux-form/UPDATE_SYNC_ERRORS',
        meta: { form: 'newPoll'},
        payload: { error: undefined, syncErrors: { choices: '* Required', title: '* Required' }}
      }, {
        type: '@@redux-form/REGISTER_FIELD',
        meta: { form: 'newPoll' },
        payload: { name: 'title', type: 'Field' }
      }, {
        type: '@@redux-form/REGISTER_FIELD',
        meta: { form: 'newPoll' },
        payload: { name: 'choices', type: 'Field' }
      }
    ]);
    await asyncFlush();
  });

  describe('Dialog', () => {
    let dialog;
    beforeEach(() => dialog = wrapper.find('Dialog'));

    it('renders properly', () => {
      expect(dialog.prop('open')).toBe(true);
      expect(dialog.prop('onClose')).toBeDefined();
      expect(typeof dialog.prop('onClose')).toBe('function');
    });
    it('onClose() resets form/closes popup', async () => {
      dialog.prop('onClose')();
      wrapper.update();
      await asyncFlush();
      expect(resetSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(closeNewPollPopupSpy).toHaveBeenCalled();
      expect(closeNewPollPopupSpy).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
  });

  describe('Cancel button', () => {
    let dialogButton;
    beforeEach(async () => {
      dialogButton = wrapper.find('Btn#cancel').find('button');
      store.clearActions();
      await asyncFlush();
    });

    it('renders properly', () => {
      expect(dialogButton.get(0)).toBeDefined();
      expect(dialogButton.prop('onClick')).toBeDefined();
      expect(dialogButton.text()).toBe('Cancel');
    });
    it('resets form/closes popup on click', async () => {
      clickButton(wrapper, 'cancel');
      wrapper.update();
      await asyncFlush();
      expect(resetSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(closeNewPollPopupSpy).toHaveBeenCalled();
      expect(closeNewPollPopupSpy).toHaveBeenCalledTimes(1);
    });
    afterEach(async () => {
      store.clearActions();
      await asyncFlush();
    });
  });
  describe('Create button', () => {
    let dialogButton;
    beforeEach(() => dialogButton = wrapper.find('Btn#submit').find('button'));

    it('renders properly', () => {
      expect(dialogButton.get(0)).toBeDefined();
      expect(dialogButton.prop('disabled')).toBe(true);
      expect(dialogButton.prop('type')).toBe('submit');
      expect(dialogButton.prop('form')).toBe('new-poll-form');
      expect(dialogButton.text()).toBe('Create');
    });
    it('disabled when any field invalid', async () => {
      fillInput(wrapper, 'title', 'Best Spaniel Breed');
      fillInput(wrapper, 'choices', 'Cocker Spaniel'); // needs 2 choices, not one
      wrapper.update();
      await asyncFlush();
      expect(dialogButton.prop('disabled')).toBe(true);
    });
    it('enabled when all fields valid', async () => {
      fillInput(wrapper, 'title', 'Best Spaniel Breed');
      fillInput(wrapper, 'choices', 'Cocker Spaniel, Springer Spaniel');
      wrapper.update();
      await asyncFlush();
      expect(dialogButton.prop('disabled')).toBe(false); // ref: ENZ UPDATE ^
    });
    it('calls handleSubmit() which resets form/closes popup on click', async () => {
      submitButton(wrapper, 'submit');
      wrapper.update();
      await asyncFlush();
      expect(handleSubmitSpy).toHaveBeenCalled();
      expect(handleSubmitSpy).toHaveBeenCalledTimes(1);
      expect(resetSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(closeNewPollPopupSpy).toHaveBeenCalled();
      expect(closeNewPollPopupSpy).toHaveBeenCalledTimes(1);
    });
    it('sends submit actions to redux on click', async () => {
      submitButton(wrapper, 'submit');
      wrapper.update();
      await asyncFlush();
      const actions = wrapper.instance().store.getActions();
      const expectedActions = [];
      expect(actions).toEqual(expectedActions); // length is 0 while no poll post action yet made (reset in submit action has been mocked)
    });
    afterEach(async () => {
      store.clearActions();
      await asyncFlush();
    });
  });

  describe('form', () => {
    let form;
    beforeEach( () => form = wrapper.find('form.form'));

    it('renders properly', () => {
      expect(form.prop('id')).toBe('new-poll-form');
      expect(form.prop('onSubmit')).toBeDefined();
      expect(typeof form.prop('onSubmit')).toBe('function');
    });
    describe('title Field', async () => {
      let connectedTitleField, titleField, titleInput;
      beforeEach(async () => {
        connectedTitleField = form.find('ConnectedField#title');
        titleField = connectedTitleField.find('TextField#title');
        titleInput = titleField.find('input#title');
        store.clearActions();
        await asyncFlush();
      });
      it('renders properly', () => {
        expect(connectedTitleField).toBeDefined();
        expect(connectedTitleField.prop('dirty')).toBe(false);
        expect(connectedTitleField.prop('pristine')).toBe(true);

        expect(titleField).toBeDefined();
        expect(titleField.text()).toBe('Title');
        expect(titleField.prop('placeholder')).toBe('Best game of 2017');
        expect(titleField.prop('error')).toBe(false);
        expect(titleField.prop('value')).toBe('');

        expect(titleInput).toBeDefined();
        expect(titleInput.prop('placeholder')).toBe('Best game of 2017');
        expect(titleInput.prop('value')).toBe('');

      });
      it('updates redux form "newPoll" on input change', async () => {
        fillInput(wrapper, 'title', 'Best Spaniel Breed');
        wrapper.update();
        await asyncFlush();
        const actions = wrapper.instance().store.getActions();
        expect(actions).toEqual([{
          type: '@@redux-form/FOCUS',
          meta: { field: 'title', form: 'newPoll' }
        }, {
          type: '@@redux-form/CHANGE',
          meta: { field: 'title', form: 'newPoll', persistentSubmitErrors: true, touch: true },
          payload: 'Best Spaniel Breed'
        }]);
      });
      // Form component only shows error messages (help text) if the
      // field has been touched. To mimic touching the field, simulate a
      // blur event, which means the input's onBlur method will run, which
      // will call the onBlur method supplied by Redux-Form.
      it("renders error in helperText when invalid because empty", async () => {
        fillInput(wrapper, 'title', '');
        wrapper.find('TextField#title').simulate('blur');
        wrapper.update();
        await asyncFlush();
        expect(getInput(wrapper, 'title')).toBe(''); // ref: ENZ UPDATE ^
        expect(wrapper.find('TextField#title').prop('error')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('TextField#title').prop('helperText')).toBe('* Required'); // ref: ENZ UPDATE ^
        expect(wrapper.find('Field#title').find('FormHelperText').text()).toBe('* Required');
        expect(wrapper.find('NewPollPopup').prop('pristine')).toBe(false); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('dirty')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('invalid')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('valid')).toBe(false); // ref: ENZ UPDATE ^
      });
      afterEach(async () => {
        store.clearActions();
        await asyncFlush();
      });
    });
    describe('choices Field', () => {
      let connectedChoicesField, choicesField, choicesInput;
      beforeEach(async () => {
        connectedChoicesField = form.find('ConnectedField#choices');
        choicesField = connectedChoicesField.find('TextField#choices');
        choicesInput = choicesField.find('input#choices');
        store.clearActions();
        await asyncFlush();
      });

      it('renders properly', () => {
        expect(connectedChoicesField).toBeDefined();
        expect(connectedChoicesField.prop('dirty')).toBe(false);
        expect(connectedChoicesField.prop('pristine')).toBe(true);

        expect(choicesField).toBeDefined();
        expect(choicesField.prop('placeholder')).toBe('Subnautica, Monster Hunter World, PUBG');
        expect(choicesField.prop('error')).toBe(false);
        expect(choicesField.prop('value')).toBe('');

        expect(choicesInput).toBeDefined();
        expect(choicesInput.prop('placeholder')).toBe('Subnautica, Monster Hunter World, PUBG');
        expect(choicesInput.prop('value')).toBe('');
        expect(wrapper.find('Field#choices').find('FormHelperText').text()).toBe('Separate choices by comma');
      });
      it('updates redux form "newPoll" on input change', async () => {
        fillInput(wrapper, 'choices', 'Cocker Spaniel, Springer Spaniel');
        wrapper.update();
        await asyncFlush();
        const actions = wrapper.instance().store.getActions();
        expect(actions).toEqual([{
          type: '@@redux-form/FOCUS',
          meta: { field: 'choices', form: 'newPoll' }
        }, {
          type: '@@redux-form/CHANGE',
          meta: { field: 'choices', form: 'newPoll', persistentSubmitErrors: true, touch: true },
          payload: 'Cocker Spaniel, Springer Spaniel'
        }]);
      });
      it("renders error in helperText when invalid because empty", async () => {
        fillInput(wrapper, 'choices', '');
        wrapper.find('TextField#choices').simulate('blur');
        wrapper.update();
        await asyncFlush();
        expect(getInput(wrapper, 'choices')).toBe(''); // ref: ENZ UPDATE ^
        expect(wrapper.find('TextField#choices').prop('error')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('TextField#choices').prop('helperText')).toBe('* Required');
        expect(wrapper.find('Field#choices').find('FormHelperText').text()).toBe('* Required'); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('pristine')).toBe(false); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('dirty')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('invalid')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('valid')).toBe(false); // ref: ENZ UPDATE ^
      });
      it("renders error in helperText when invalid because not complete", async () => {
        expect(wrapper.find('TextField#choices').prop('helperText')).toBe('Separate choices by comma');
        fillInput(wrapper, 'choices', 'Cocker Spaniel'); // incomplete - needs 2 choices
        wrapper.find('TextField#choices').simulate('blur');
        wrapper.update();
        await asyncFlush();
        expect(getInput(wrapper, 'choices')).toBe(''); // ref: ENZ UPDATE ^
        expect(wrapper.find('TextField#choices').prop('error')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('TextField#choices').prop('helperText')).toBe('* At least 2 choices required'); // ref: ENZ UPDATE ^
        expect(wrapper.find('Field#choices').find('FormHelperText').text()).toBe('* At least 2 choices required');
        expect(wrapper.find('NewPollPopup').prop('pristine')).toBe(false); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('dirty')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('invalid')).toBe(true); // ref: ENZ UPDATE ^
        expect(wrapper.find('NewPollPopup').prop('valid')).toBe(false); // ref: ENZ UPDATE ^
      });
      afterEach(async () => {
        store.clearActions();
        await asyncFlush();
      });
    });
  });
});
