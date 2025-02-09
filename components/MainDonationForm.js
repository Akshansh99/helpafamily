import React from 'react';
import { useRouter } from 'next/router';

import Modal from './Modal';

export default function MainDonationForm() {
  const router = useRouter();
  const [modalText, setModalText] = React.useState('');
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(0);

  const hideModal = () => setModalOpen(false);

  const showModal = (message) => {
    setModalText(message);
    setModalOpen(true);
  };

  const handleChangeAmount = (event) => {
    setAmount(event.target.value);
  };

  // isAnyoneInNeedToggled = stores the state of the "Anyone in need" toggle
  const [isAnyoneInNeedToggled, setIsAnyoneInNeedToggled] =
    React.useState(true);
  const [causes, setCauses] = React.useState([
    {
      text: 'Students in Need',
      isChecked: true,
    },
    {
      text: 'People of Color in Need',
      isChecked: true,
    },
    {
      text: 'Immigrants in Need',
      isChecked: true,
    },
    {
      text: 'Seniors in Need',
      isChecked: true,
    },
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Alert the user if they haven't selected a donation amount
    if (amount === 0) {
      showModal('Please choose an amount to give');
      return;
    }

    // Create an array of all selected checkboxes
    // selectedCauses becomes the string used on the Stripe checkout page
    let selectedCauses = [];
    for (let i = 0; i < causes.length; i++) {
      if (causes[i].isChecked) {
        selectedCauses.push(`  ${causes[i].text}`);
      }
    }

    // If the "Anyone" toggle is on, or if all causes are selected,
    // summarize all causes as "Anyone in Need"
    if (isAnyoneInNeedToggled || causes.length === selectedCauses.length) {
      selectedCauses = [' Anyone in Need'];
    }

    if (selectedCauses.length === 0) {
      showModal('Please select a cause for donation');
      return;
    }

    // Create the Stripe checkout session and forward to the checkout page
    const response = await fetch('/api/create-stripe-session', {
      body: JSON.stringify({
        amount: amount * 100,
        cause: selectedCauses,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const result = await response.json();
    router.push(result.url);
  };

  // handleClick is called via the onClick event when the user clicks
  // on the "Anyone in need" toggle switch
  const handleClick = () => {
    setIsAnyoneInNeedToggled(!isAnyoneInNeedToggled);

    // If the "Anyone in need" toggle is on, we need to uncheck all the
    // checkboxes in the cause list
    if (!isAnyoneInNeedToggled) {
      const data = causes;

      // Loop through all the checkboxes in the cause list and uncheck them
      for (let i = 0; i < data.length; i++) {
        data[i].isChecked = true;
      }
      setCauses(data);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div
          className="p-6 mb-5 card bordered bg-base-100"
          data-theme="cupcake"
        >
          <h2 className="card-title" data-theme="light">
            {'Help us develop programs for:'}
          </h2>

          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">{'Anyone in Need'}</span>
              <input
                autoComplete="off"
                checked={isAnyoneInNeedToggled}
                className="toggle"
                name="cause"
                onChange={handleClick}
                type="checkbox"
                value="Anyone in Need"
              />
            </label>
          </div>

          {causes.map((item, index) => {
            return (
              <div
                className="form-control"
                key={index.toString()}
                style={
                  isAnyoneInNeedToggled
                    ? {
                        display: 'none',
                      }
                    : {}
                }
              >
                <label className="cursor-pointer label">
                  <span className="label-text">{item.text}</span>
                  <input
                    // Prevents the browser from using cached checkbox states.
                    // The use of cached values caused interaction issues that were
                    // unintended.
                    autoComplete="off"
                    checked={item.isChecked}
                    className="checkbox donate-form-checkbox"
                    name="cause"
                    onChange={() => {
                      const data = [...causes];
                      if (data[index].isChecked) {
                        setIsAnyoneInNeedToggled(false);
                      }
                      data[index].isChecked = !data[index].isChecked;
                      setCauses(data);
                    }}
                    type="checkbox"
                    value={item.text}
                  />
                </label>
              </div>
            );
          })}

          <div style={{ marginBottom: '10px' }} />

          <select
            className="select select-bordered select-info w-full max-w-xs text-white-700"
            name="amount"
            onChange={handleChangeAmount}
            value={amount}
          >
            <option disabled="disabled" value="0">
              {'Choose your donation amount'}
            </option>
            <option value="5">{'$5'}</option>
            <option value="25">{'$25'}</option>
            <option value="50">{'$50'}</option>
            <option value="75">{'$75'}</option>
            <option value="125">{'$125'}</option>
            <option value="250">{'$250'}</option>
            <option value="500">{'$500'}</option>
            <option value="1000">{'$1,000'}</option>
            <option value="5000">{'$5,000'}</option>
            <option value="10000">{'$10,000'}</option>
            <option value="25000">{'$25,000'}</option>
          </select>

          <div className="divider" />

          {/* <div className="form-control">
  <label className="cursor-pointer label">
    <span className="label-text">Monthly Recurring?</span> 
    <input type="checkbox" name="recurring" className="checkbox checkbox-primary"></input>
  </label>
</div>   */}

          <button className="btn btn-primary" type="submit">
            {'Donate'}
          </button>
        </div>
      </form>
      <Modal isOpen={isModalOpen} onClose={hideModal}>
        {modalText}
      </Modal>
    </>
  );
}
