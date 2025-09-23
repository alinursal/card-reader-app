import React from 'react';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import moment from 'moment-timezone';
import { debounce } from 'lodash';
import { submitCardData, submitOneCard } from "../../actions/card";
import { submitOneStudent } from "../../actions/students";
import cardReaderImage from "../../img/card_reader_image.jpg";
import { Message } from 'primereact/message';
import _ from 'lodash';
import { Messages } from 'primereact/messages';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      students: [],
      failed: [],
      submitted: [],
      notVerified: [],
      sameSwipe: [],
      frozenRows: [],
      regularRows: [],
      successMessageSubmitAll: false,
      showMessageFailed: false,
      successMessageSubmitFailedOnes: false,
      showMessageUnverifiedSubmitFailed: false,
      showMessageUnverifiedSubmitSuccess: false,
      showSaveButton: false,
      seconds: 180,
      autoSaveTriggered: false,
      dropdownCourse: [],
      selectedCourse: null
    };

    // Create a ref for the input element
    this.nameInputRef = React.createRef();

    // Bind methods
    this.handleUserAction = this.handleUserAction.bind(this);

    // Debounce the function that submits one card to avoid too many rapid requests
    this.debouncedSubmitCard = debounce(this.submitOneCard, 500);

    this.submitNow = this.submitNow.bind(this);
    this.submitFailed = this.submitFailed.bind(this);

    this.dataTableRef = React.createRef(); 

    this.msgs = React.createRef();

  }

  componentDidMount() {

    // Focus the input using the ref after the component mounts
    if (this.nameInputRef.current) {
      this.nameInputRef.current.focus();
    }
    // Set up event listeners for user activity
    window.addEventListener('mousemove', this.handleUserAction);
    window.addEventListener('keydown', this.handleUserAction);

   const fetchAdminData = async () => {
     await this.getAllAdmin(this.props.username);
   };
   fetchAdminData();

  }



  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleUserAction);
    window.removeEventListener('keydown', this.handleUserAction);
  }

  runAutoSave() {

    if (this.state.autoSaveTriggered) return;

    this.setState({ autoSaveTriggered: true, showMessageFailed: true });

    this.interval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.seconds > 0) {
          return { seconds: prevState.seconds - 1 };
        } else {
          clearInterval(this.interval);
          return { seconds: 0 };
        }
      });
    }, 1000);

    this.submitTimeout = setTimeout(() => {
      this.submitFailed();
    }, 180000); 

  }

  handleUserAction() {
    // Refocus the input on user action
    if (this.nameInputRef.current) {
      this.nameInputRef.current.focus();
    }
  }

  async getAllAdmin(getUserName) {

    try {

         const res = await axios.get(`http://localhost:8080/api/users/admin`);
         const getResult = res.data.map((item) => ({
          id: Number(item.id),
          username: item.username,
          email: item.email,
          firstname: item.firstname,
          lastname: item.lastname,
          userlevel: item.userlevel,
          coursename: item.coursename,
          courseowner: item.courseowner,
         }));

         let getCourseName = [];
         let getCourseOwner = [];

         let findAdminCourseName = getResult.filter(
           (item) => item.username === getUserName
         );

        if (findAdminCourseName && findAdminCourseName.length > 0) {
         getCourseName = Array.isArray(findAdminCourseName[0].coursename) 
         ? findAdminCourseName[0].coursename 
         : [];
  
         getCourseOwner = Array.isArray(findAdminCourseName[0].courseowner) 
         ? findAdminCourseName[0].courseowner 
         : [];
        }

        let combinedCourses = [...new Set([...getCourseName, ...getCourseOwner])];

        this.setState({ dropdownCourse: combinedCourses });

    } catch (err) {
    console.error(err);
    throw err;
    }

  }

  submitOneCard = (value) => {
    const date = moment(new Date()).tz("America/Toronto").format("YYYY-MM-DD");

    let checkStudentList = false;
    const findStudentNumber = this.state.students.filter(
      (card) =>
      card.cardnumber === value
    );

    if(findStudentNumber && findStudentNumber.length>0){
      checkStudentList = true;
    }

    if(checkStudentList===true){

     const data = { cardnumber: value, date: date, coursename: this.state.selectedCourse, verified: checkStudentList };

     this.props.submitOneCard(data).then((response) => {
      if(response.hasOwnProperty('data')){
        if(response.data === "success"){
          this.setState((prevState) => ({
           submitted: [
            ...prevState.submitted,
            { cardnumber: value, date: date, coursename: this.state.selectedCourse, verified: checkStudentList },
           ],
          }));
        }else if(response.data === "error"){
         this.setState((prevState) => ({
         failed: [
          ...prevState.failed,
          { cardnumber: value, date: date, coursename: this.state.selectedCourse, verified: checkStudentList },
         ],
         }));
        }else{
         this.setState((prevState) => ({
         failed: [
          ...prevState.failed,
          { cardnumber: value, date: date, coursename: this.state.selectedCourse, verified: checkStudentList },
         ],
         }));
        }
      }else{
       this.setState((prevState) => ({
        failed: [
          ...prevState.failed,
          { cardnumber: value, date: date, coursename: this.state.selectedCourse, verified: checkStudentList },
        ],
       }));
      }
      if (this.state.failed.length > 0) {
         this.runAutoSave();
      }
     }).catch((error) => {
      if(error){
       this.setState((prevState) => ({
        failed: [
          ...prevState.failed,
          { cardnumber: value, date: date, coursename: this.state.selectedCourse, verified: checkStudentList },
        ],
       }));
        if (this.state.failed.length > 0) {
        this.runAutoSave();
        }
      }
      console.error(error);
     });
    }
  };

  onChangeText = (e) => {
    const value = e.target.value;
    this.setState({ successMessageSubmitAll: false });
    if (value.length === 9) {
     const date = moment(new Date()).tz("America/Toronto").format("YYYY-MM-DD");
     let checkStudentList = false;
     const findStudentNumber = this.state.students.filter(
      (card) =>
      card.cardnumber === value
     );

     if(findStudentNumber && findStudentNumber.length>0){
       checkStudentList = true;
     }

      if(checkStudentList === true){

        this.setState(
          (prevState) => {
           const isCardNumberExists = prevState.data.some(
           (item) => item.cardnumber === value
          );
           
          if (isCardNumberExists) {
           this.setState((prevState) => {
           const isSame = prevState.sameSwipe.some((item) => item.cardnumber === value);
            return isSame
              ? {}
              : {
              sameSwipe: [
              ...prevState.sameSwipe,
              {
              id: Math.floor(Math.random() * 1000),
              cardnumber: value,
              date: date,
              coursename: this.state.selectedCourse,
              verified: checkStudentList,
              },
             ],
             }
            },
            () => {
              const isSame = prevState.sameSwipe.some((item) => item.cardnumber === value);
              if(!isSame){
               this.msgs.current?.show([
                {
                        sticky: true,
                        severity: 'warn',
                        detail: `Duplicated swipe for ${value}`
                    }
                ]);
              }
            }
           );
           return null;
          }

          this.debouncedSubmitCard(value);

          return {
           data: [
             ...prevState.data,
            {
            cardnumber: value,
            id: Math.floor(Math.random() * 1000),
            date: date,
            coursename: this.state.selectedCourse,
            verified: checkStudentList,
            },
           ],
          };
          },
         () => {
         this.updateRowStates();
         //this.scrollToBottom();
         }
        );

      }else if(checkStudentList===false){
       this.setState((prevState) => {
        const isDuplicate = prevState.notVerified.some((item) => item.cardnumber === value);
        return isDuplicate
        ? {}
        : {
          notVerified: [
           ...prevState.notVerified,
           {
             id: Math.floor(Math.random() * 1000),
             cardnumber: value,
             date: date,
             coursename: this.state.selectedCourse,
             verified: checkStudentList,
           },
          ],
         };
       });
      }

      e.target.value = '';
    }
  };

  submitNow = e => {
    e.preventDefault();
    this.props.submitCardData(this.state.data).then(() => {
      this.setState({ showMessageFailed: false });
      this.setState({ successMessageSubmitAll: true });
    });
  }

  submitFailed = () => {
    this.props.submitCardData(this.state.failed).then((response) => {
      if(response.hasOwnProperty('data')){
        if(response.data === "success"){
          this.setState({ showMessageFailed: false });
          this.setState({ successMessageSubmitFailedOnes: true });
        }else if(response.data === "error"){
          this.setState({ showSaveButton: true });
        }else{
          this.setState({ showSaveButton: true });
        }
      }else{
         this.setState({ showSaveButton: true });
      }
    }).catch((error) => {
      this.setState({ showSaveButton: true });
      console.error(error);
    });
  }

  setSeconds = (newSeconds) => {
    this.setState({ seconds: newSeconds });
  };

  onCourseChange = (e) => {
    const val = (e.target && e.target.value) || '';
    this.setState(
    {
     data: [],
     submitted: [],
     notVerified: [],
     failed: [],
     sameSwipe: [], 
    },
    () => {
    this.updateRowStates();
    }
    );
    this.setState({ selectedCourse: val });
    this.getStudents(val);
  };

  getStudents(selectedCourse){
    axios
      .get(`http://localhost:8080/api/users/students`)
      .then((res) => {
        const getAllStudents = res.data.students.map((item) => ({
          id: item.id,
          cardnumber: item.cardnumber,
          uploaddate: item.uploaddate ? item.uploaddate.substring(0, 10) : null,
          coursename: item.coursename,
        }));
        const filterStudents = getAllStudents.filter(
          (card) =>
          card.coursename === selectedCourse
        );
        this.setState({ students: filterStudents });
      })
      .catch((err) => console.error(err));
  }

  verifiedBodyTemplate = (rowData) => {
   return (
    <p>
      {rowData.verified 
        ? <i className="pi pi-verified"> Yes</i> 
        : <i className="pi pi-times-circle"> No</i>
      }
    </p>
    );
  };

  scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  updateRowStates = () => {
    const frozenRows = this.state.data.filter((row) => !row.verified);
    const regularRows = this.state.data.filter((row) => row.verified);
    this.setState({ frozenRows, regularRows });
  };

  rowClassName = (rowData) => {
    return rowData.verified ? '' : 'frozen-row';
  };

  onSubmitUnverified = (e) => {
    e.preventDefault();
    let getCardNumber = e.currentTarget.getAttribute('data-get');
    let date = moment(new Date()).tz("America/Toronto").format("YYYY-MM-DD");
    const data = { cardnumber: getCardNumber, uploaddate: date, coursename: this.state.selectedCourse };
    this.props.submitOneStudent(data).then((response) => {
      if(response && response.hasOwnProperty('data')){
        if(response.data === "success"){
          this.setState({ showMessageUnverifiedSubmitFailed: false });
          this.setState({ showMessageUnverifiedSubmitSuccess: true });
          this.getStudents(this.state.selectedCourse);
          this.setState((prevState) => ({
             notVerified: prevState.notVerified.filter(
              (item) => item.cardnumber !== getCardNumber
             ),
          }));
          this.setState((prevState) => ({
           data: [
            ...prevState.data,
            { cardnumber: getCardNumber, id: Math.floor(Math.random() * 1000), date: date, coursename: this.state.selectedCourse, verified: true },
           ],
          }),
          () => {
          this.debouncedSubmitCard(getCardNumber);
          this.updateRowStates();
          }
          );
        }else if(response.data === "error"){
          this.setState({ showMessageUnverifiedSubmitFailed: true });
        }else{
          this.setState({ showMessageUnverifiedSubmitFailed: true });
        }
      }else{
         this.setState({ showMessageUnverifiedSubmitFailed: true });
      }
    }).catch((error) => {
      console.error(error);
      this.setState({ showMessageUnverifiedSubmitFailed: true });
    });
  };

  onClearUnverified = (e) => {
    e.preventDefault();
    let getCardNumber = e.currentTarget.getAttribute('data-get');
    this.setState((prevState) => ({
      notVerified: prevState.notVerified.filter(
       (item) => item.cardnumber !== getCardNumber
      ),
    }));
  };

  render() {
    const { frozenRows, regularRows, successMessageSubmitAll, showMessageFailed, successMessageSubmitFailedOnes, seconds, showSaveButton, submitted, failed, dropdownCourse, selectedCourse, notVerified, sameSwipe } = this.state;

    return (
      <div className="flex flex-wrap">
        <div className="m-4 mr-2 pl-2">
            <div className="formgrid">
              <div className="field">
               <Tag style={{ background: 'white' }}>
                 {Array.isArray(dropdownCourse) && dropdownCourse.length > 0 ?
                 (
                   <div className="grid">
                    <div className="col-7 px-3 py-3">
                     <Dropdown value={selectedCourse} onChange={this.onCourseChange} options={dropdownCourse} optionLabel="name" placeholder="Select a Course" 
                      showClear filter className="w-full md:w-14rem toTheLeft" />
                    </div>
                   </div>
                 )
                 : 
                 (
                  <div className="grid">
                    <div className="col-12 px-3 py-3">
                       <p style={{ color: 'black', fontWeight: 'bold', fontSize: '14px' }}>No courses found. Get started by managing your courses.</p>
                       <Link to="/manage"><Button label="Manage" severity="help" style={{ fontSize: '14px' }}/></Link>
                    </div>
                  </div>
                 )}
                </Tag>
              </div>
            </div>

         {selectedCourse && 
            (
            <div className="formgrid grid">
             <div className="field col md:col-6">
              <Tag style={{background: 'linear-gradient(-225deg,#AC32E4 0%,#7918F2 48%,#4801FF 100%)'}}>
                <div className="grid">
                  <div className="col-4 px-3 py-3">
                    <img alt="card reader" src={cardReaderImage} className="mr-2 shadow-6"/>
                  </div>
                  <div className="col-7 px-3 py-3">
                    <div className="flex align-items-center gap-2">
                     <span className="text-base">Card Reader Instructions</span>
                    </div>
                    <span className="text-sm">1. Insert the card reader into a USB port.</span><br/>
                    <span className="text-sm">2. Stay on this page while using the card reader.</span>
                  </div>          
               </div>
              </Tag>
              <br/>
              <input
                type="text"
                id="name"
                name="name"
                onChange={this.onChangeText}
                ref={this.nameInputRef}
                className="hiddenInput"
              />
            </div>
            <div className="field col-12">
              <br />
              <div className="card">
                <Card className="customizeCardWidthForDashboard">
                  <div className="m-0">
                    {showSaveButton &&
                      (
                        <div className="mb-3 font-bold text-1xl">
                          <br />
                          <p>Please click Save button!</p>
                          <br />
                          <Button label="Save" severity="help" onClick={this.submitNow} />
                        </div>
                    )}
                    {showMessageFailed &&
                      (
                        <div className="mb-3 font-bold text-1xl">
                          <br />
                          <p>Wait {seconds} seconds to save {failed.length} more!</p>
                          <br />
                        </div>
                    )}
                    {successMessageSubmitAll &&
                      (
                        <div>
                          <br />
                          <p>All saved successfully!</p>
                          <br />
                        </div>
                    )}
                    {successMessageSubmitFailedOnes &&
                      (
                        <div>
                          <br />
                          <p>{failed.length} more student{failed.length > 1 ? 's have' : ' has'} attended!</p>
                          <br />
                        </div>
                    )}
                    {submitted.length > 0 &&
                      (
                        <div>
                          <br />
                          <p>{submitted.length} student{submitted.length > 1 ? 's have' : ' has'} attended!</p>
                          <br />
                        </div>
                    )}
                    {notVerified.length > 0 &&
                      (
                        <div>
                          {_.map(notVerified, ({ id, cardnumber }) => (
                            <div key={id} className="mousePoint" style={{ marginTop: '15px' }}>
                              <Message severity="error" text={`${cardnumber} is not in your class list. Would you like to add it?`} />
                              <div style={{ marginTop: '15px' }}>
                               <Button type="button" data-get={cardnumber} onClick={this.onSubmitUnverified} label="Yes" className="mr-2"/>
                               <Button type="button" data-get={cardnumber} onClick={this.onClearUnverified} label="No" className="p-button-secondary"/>
                              </div>
                            </div>
                          ))}
                        </div>
                    )}
                    {sameSwipe.length > 0 &&
                      (
                        <div>
                         <Messages ref={this.msgs} />
                        </div>
                    )}
                     <div id="table-container" style={{ height: '400px', overflow: 'auto', marginTop: '15px' }}>
                      <DataTable value={regularRows} frozenValue={frozenRows} ref={this.dataTableRef} rowClassName={this.rowClassName} scrollable emptyMessage=" ">
                       <Column field="cardnumber" header="Card Number"></Column>
                       <Column field="verified" header="Attended" dataType="boolean" bodyClassName="text-center" body={this.verifiedBodyTemplate} />
                      </DataTable>
                     </div>
                  </div>
                </Card>
              </div>
             </div>
            </div>
            )}
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  submitCardData: PropTypes.func.isRequired,
  submitOneCard: PropTypes.func.isRequired,
  submitOneStudent: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  username: state.user.username,
});

const mapDispatchToProps = (dispatch) => ({
  submitCardData: (data) => dispatch(submitCardData(data)),
  submitOneCard: (data) => dispatch(submitOneCard(data)),
  submitOneStudent: (data) => dispatch(submitOneStudent(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
