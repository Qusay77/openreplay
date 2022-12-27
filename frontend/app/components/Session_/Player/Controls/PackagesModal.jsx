import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import { eventTracker } from '../productAnalytics';
import Icon from './icons/icon.svg';
//clickable
import XIcon from './icons/X_icon.svg';
import axios from 'axios';

const ModalContainer = styled.div`
  height: 291px;
  width: 477px;
  border-radius: 15px;
  background-color: #fff;
  background-image: url(${Icon});
  background-repeat: no-repeat;
  background-position: center 40px;
  font-family: Open Sans;
  display: flex;
  justify-content: center;
`;

const CloseIcon = styled.img`
  height: fit-content;
  width: fit-content;
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 124px;
`;

const MainParagraph = styled.p`
  font-size: 18px;
  font-weight: 700;
  line-height: 25px;
  letter-spacing: 0.1;
  text-align: center;
  margin: 0;
`;

const SmallParagraphContainer = styled.div`
  font-size: 15px;
  line-height: 25px;
  letter-spacing: 0px;
  text-align: center;
  p {
    margin: 0;
    display: inline;
  }
`;
const SmallParagraph = styled.p`
  font-weight: 400;
  color: #171725;
`;

const OkButton = styled.div`
  height: 47px;
  width: 140px;
  border-radius: 10px;
  background-color: #0062ff;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 40px;
  cursor: ${({ triggered }) => (triggered ? 'unset' : 'pointer')};
  user-select: none;
`;

const customStyles = {
  overlay: {
    zIndex: 99999,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '5px',
    padding: 0,
  },
};
// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#modal-root_p');

const sendEmail = async (data) => {
  // const url ='http://localhost:8080/mail'
  const url = 'https://portal.webeyez.com/mail';
  try {
    axios({
      method: 'post',
      url: url,
      data: {
        data,
      },
    });
  } catch (e) {
    console.log(e, 'ending email data');
  }
};

const BigParagraph = styled.p`
  font-weight: 500;
  font-size: 40px;
  color: #0062ff;
  position: absolute;
  top: 150px;
  user-select: none;
`;

const PackageUpgradeModal = ({ email, orgId }) => {
  const [textState, setTextState] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const contact = () => {
    setTextState(true);
    const emailData = {
      orgId,
      email,
      permission: 'SESSION_RECORDING_ANALYSIS',
    };
    eventTracker(
      `Permissions -( SESSION_RECORDING_ANALYSIS ) - Email Sent`,
      email,
      'SESSION_RECORDING_ANALYSIS'
    );
    sendEmail(emailData);
  };
  const closeModal = () => {
    setIsOpen(false);
    eventTracker(
      `Permissions -( SESSION_RECORDING_ANALYSIS ) - close`,
      email,
      'SESSION_RECORDING_ANALYSIS'
    );
  };
  const modalRef = useRef(null);
  const callback = (mutationsList, targetNode) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        const data = mutation.target.attributes.data;
        if (data) {
          setIsOpen(true);
        }
        targetNode.removeAttribute('data');
      }
    }
  };

  useEffect(() => {
    const targetNode = modalRef.current;
    const config = { attributes: true };
    const observer = new MutationObserver((c) => callback(c, targetNode));
    if (targetNode) {
      observer.observe(targetNode, config);
    }
  }, [modalRef]);

  return (
    <div id="modalId_p" ref={modalRef}>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Packages Modal"
      >
        <ModalContainer>
          <CloseIcon onClick={closeModal} src={XIcon} />
          {textState ? (
            <BigParagraph>Thank You!</BigParagraph>
          ) : (
            <>
              <TextContainer>
                <MainParagraph>This feature is not included in your package</MainParagraph>
                <SmallParagraphContainer>
                  <SmallParagraph>
                    Our experts will contact you to discuss your needs
                  </SmallParagraph>
                </SmallParagraphContainer>
              </TextContainer>
              <OkButton onClick={contact}>Contact Me</OkButton>
            </>
          )}
        </ModalContainer>
      </Modal>
    </div>
  );
};

export default PackageUpgradeModal;
