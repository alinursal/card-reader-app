import React from 'react';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import axios from "axios";
import { eligibleUploadSubmit } from "../../actions/manage";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Paginator } from 'primereact/paginator';
import { Toolbar } from 'primereact/toolbar';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import readXlsxFile from 'read-excel-file';
import moment from 'moment-timezone';
import { Checkbox } from "primereact/checkbox";

class Manage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      allstudents: [],
      alladmin: [],
      courseadmin: [],
      allcourses: [],
      courseowner: [],
      backupdata: [],
      first: 0,
      rows: 30,
      rowsPerPageOptions: [],
      globalFilter: '',
      globalFilterStudent: '',
      globalFilterAdmin: '',
      globalFilterCourseList: '',
      product: this.emptyProduct(),
      uploaddata: this.emptyProduct(),
      uploadsingledata: this.emptyProduct(),
      addAdmin: this.emptyAdmin(),
      addCourse: this.emptyCourse(),
      selectedStudentList: [],
      selectedAdminList: [],
      selectedCourseList: [],
      selectedDate: null,
      selectedReportDate: null,
      dropdownDate: [],
      submitted: false,
      productDialog: false,
      uploadDialog: false,
      uploadSingleDialog: false,
      addAdminDialog: false,
      addCourseDialog: false,
      dropdownCourse: [],
      selectedCourse: null,
      selectedAddDate: null,
      absenceChecked: false,
      presentChecked: false
    };

    this.dt = React.createRef(); // DataTable ref
    this.sl = React.createRef();
    this.ad = React.createRef();
    this.cl = React.createRef();
    this.toast = React.createRef(); // Toast ref

  }

  componentDidMount() {
    //this.onInit(this.props);
   const fetchAdminData = async () => {
     await this.getAllAdmin(this.props.username);
   };
  fetchAdminData();

  }

  onInit = (props) => {
    props.fetchStudents();
  }

  emptyProduct() {
    return { id: null, cardnumber: '', date: '', coursename: '' };
  }

  emptyAdmin() {
    return { id: null, username: '', email: '', firstname: '', lastname: '', userlevel: '', coursename: '' };
  }

  emptyCourse() {
    return { id: null, username: '', coursename: '', courseowner: '' };
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
         let finalResult = [];

         const uniqueCourseNames = [...new Set(getResult.flatMap(user => [
          ...(Array.isArray(user.coursename) ? user.coursename : []),
          ...(Array.isArray(user.courseowner) ? user.courseowner : []),
         ]))];

         const allCourseNames = uniqueCourseNames.map(course => {
          const owner = getResult.find(user => user.courseowner && user.courseowner.includes(course));
           return {
            id: Math.floor(Math.random() * 1000000),
            coursename: course,
            courseowner: owner ? owner.email : null
           };
         });

         let findAdminCourseName = getResult.filter(
          (item) =>
          item.username === getUserName
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

         if (this.state.selectedCourse) {
          finalResult = getResult.filter(
           (item) => Array.isArray(item.coursename) && item.coursename.includes(this.state.selectedCourse)
           );
          }else{
          if (getCourseName) {
           finalResult = getResult.filter(
           (item) => Array.isArray(item.coursename) && item.coursename.some((course) => combinedCourses.includes(course))
          );
          }
         }


          this.setState({ courseadmin: finalResult });
          this.setState({ alladmin: getResult });
          this.setState({ allcourses: allCourseNames });
          this.setState({ courseowner: getCourseOwner });
          this.setState({ dropdownCourse: combinedCourses });

    } catch (err) {
    console.error(err);
    throw err;
    }

  }

  getCardInfo(getCourseName) {
    axios
      .get(`http://localhost:8080/api/manage`)
      .then((res) => {
        const getResult = res.data.data.map((item) => ({
          id: item.id,
          cardnumber: item.cardnumber,
          date: item.date ? item.date.substring(0, 10) : null,
          coursename: item.coursename,
          verified: item.verified,
        }));

        const finalResult = getResult.filter(
          (card) =>
          card.coursename === getCourseName
        );

        let dropdown = [];

        dropdown.push({ name: "All", value: "All" });
           for (var z = 0; z < finalResult.length; z++) {
                if(finalResult[z].date){
                 dropdown.push({ name: finalResult[z].date, value: finalResult[z].date });
                }
           }

        dropdown = dropdown.filter((thing, index, self) => index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(thing)));
        this.setState({ dropdownDate: dropdown });


        this.getStudents(finalResult);

      })
      .catch((err) => console.error(err));
  }

  getStudents(getCardData){
    axios
      .get(`http://localhost:8080/api/users/students`)
      .then((res) => {
        const getAllStudents = res.data.students.map((item) => ({
          id: item.id,
          cardnumber: item.cardnumber,
          uploaddate: item.uploaddate ? item.uploaddate.substring(0, 10) : null,
          coursename: item.coursename,
        }));
        const getFinalData = [];

        const allStudentList = getAllStudents.filter(
          (card) =>
          card.coursename === this.state.selectedCourse
         );

        this.setState({ allstudents: allStudentList });


        // Step 1: Extract unique dates only for the matching course name
        const uniqueDates = [
         ...new Set(
         getCardData
        .filter((card) => card.coursename === this.state.selectedCourse)
        .map((card) => card.date)
        )
       ];

      for (let x = 0; x < getAllStudents.length; x++) {
       if (getAllStudents[x].coursename === this.state.selectedCourse) {

          const cardDataList = getCardData.filter(
          (card) =>
          card.cardnumber === getAllStudents[x].cardnumber &&
          card.coursename === this.state.selectedCourse &&
          card.verified === true
          );

          const attendedDates = cardDataList.map((card) => card.date); // Dates where student was present

        if (cardDataList.length > 0) {
          cardDataList.forEach((card) => {
           getFinalData.push({
            id: Math.floor(Math.random() * 10000),
            cardnumber: getAllStudents[x].cardnumber,
            date: card.date,
            coursename: getAllStudents[x].coursename,
            status: 'present',
           });
          });
 
         const missingDates = uniqueDates.filter(
          (date) => !attendedDates.includes(date) // Dates not attended
         );

         missingDates.forEach((date) => {
          getFinalData.push({
            id: Math.floor(Math.random() * 10000),
            cardnumber: getAllStudents[x].cardnumber,
            date: date,
            coursename: getAllStudents[x].coursename,
            status: 'absent',
          });
         });
        }else{
         uniqueDates.forEach((date) => {
          getFinalData.push({
           id: Math.floor(Math.random() * 10000),
           cardnumber: getAllStudents[x].cardnumber,
           date: date,
           coursename: getAllStudents[x].coursename,
           status: 'absent',
          });
         });
        }
       }
      }

      if(getFinalData && getFinalData.length>0){
          const uniqueData = getFinalData.filter(
           (thing, index, self) =>
           index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(thing))
          );
          getFinalData.length = 0;
          getFinalData.push(...uniqueData);
      }

        const dataLength = getFinalData.length;
        const rowsPerPageOptions = this.calculateRowsPerPageOptions(dataLength);

        this.setState({ data: getFinalData, rowsPerPageOptions });
        this.setState({ backupdata: getFinalData });

      })
      .catch((err) => console.error(err));
  }

  calculateRowsPerPageOptions(dataLength) {
   if (dataLength === 0) {
    return []; // No options when there's no data
   }
   if (dataLength <= 5) {
    // For very small datasets, generate options from 1 to dataLength
    return Array.from({ length: dataLength }, (_, i) => i + 1);
   }
   const step = Math.ceil(dataLength / 5); // Generate step dynamically
   const defaultOptions = Array.from({ length: 4 }, (_, i) => step * (i + 1)) // Generate options
    .filter((option) => option <= dataLength); // Keep options within range
   if (!defaultOptions.includes(dataLength)) {
    defaultOptions.push(dataLength); // Ensure dataLength is included
   }
   return defaultOptions;
  }

  onPageChange = (event) => {
    this.setState({
      first: event.first,
      rows: event.rows,
    });
  };

  openNew = () => {
    this.setState({ product: this.emptyProduct(), productDialog: true });
  };

  showUploadModal = () => {
    this.setState({ uploaddata: this.emptyProduct(), uploadDialog: true });
  };

  showUploadSingleModal = () => {
    this.setState({ uploadsingledata: this.emptyProduct(), uploadSingleDialog: true });
  };

  hideDialog = () => {
    this.setState({ submitted: false, productDialog: false });
  };

  hideUploadDialog = () => {
    this.setState({ uploadDialog: false });
  };

  hideUploadSingleDialog = () => {
    this.setState({ uploadSingleDialog: false });
  };

  showAdminModal = () => {
    this.setState({ addAdmin: this.emptyAdmin(), addAdminDialog: true });
  };

  hideAdminDialog = () => {
    this.setState({ addAdminDialog: false });
  };

  showCreateCourseModal = () => {
    this.setState({ addCourse: this.emptyCourse(), addCourseDialog: true });
  };

  hideCreateCourseModal = () => {
    this.setState({ addCourseDialog: false });
  };

  deleteSelectedStudentList = () => {
    const { data, selectedStudentList } = this.state;

    if (selectedStudentList.length === 0) {
      this.toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No Student Selected', life: 3000 });
      return;
    }

    const selectedIds = selectedStudentList.map(product => product.id);
    const selectedDataIds = selectedStudentList.map(product => product);

    this.deleteRowStudentListDatabase(selectedDataIds)
      .then(() => {
        const updatedProducts = data.filter(product => !selectedIds.includes(product.id));

        this.setState({
          data: updatedProducts,
          selectedStudentList: [],
        });

        this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Items Deleted', life: 6000 });
      })
      .catch(err => {
        this.toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete items', life: 6000 });
        console.error(err);
      });
  };

  deleteSelectedAdminList = () => {
    const { courseadmin, selectedAdminList } = this.state;

    if (selectedAdminList.length === 0) {
      this.toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No Student Selected', life: 3000 });
      return;
    }

    const selectedIds = selectedAdminList.map(product => product.id);
    const selectedDataIds = selectedAdminList.map(product => product);

    this.deleteRowAdminListDatabase(selectedDataIds)
      .then(() => {
        const updatedProducts = courseadmin.filter(product => !selectedIds.includes(product.id));
        this.setState({
          courseadmin: updatedProducts,
          selectedAdminList: [],
        });
        if(this.toast.current){
          this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Admin Deleted', life: 6000 });
        }
      })
      .catch(err => {
        if(this.toast.current){
        this.toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete admin', life: 6000 });
        }
        console.error(err);
      });
  };

  deleteSelectedCourseList = () => {
    const { allcourses, selectedCourseList, courseowner } = this.state;

    if (selectedCourseList.length === 0) {
      this.toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No Course Selected', life: 3000 });
      return;
    }

    let selectedIds = selectedCourseList
     .filter(product => courseowner.includes(product.coursename))
     .map(product => product.id); 
    let selectedCourseName = selectedCourseList.map(product => product.coursename);

    const areArraysSame = courseowner.length === selectedCourseName.length &&
     courseowner.every(course => selectedCourseName.includes(course)) &&
     selectedCourseName.every(course => courseowner.includes(course));

    selectedCourseName = selectedCourseName.filter(course => courseowner.includes(course));

     if(!areArraysSame){
       this.toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Not an Owner', life: 3000 });
     }

    this.deleteRowCourseListDatabase(selectedCourseName)
    .then(() => this.deleteRowCourseOwnerDatabase(selectedCourseName))
    .then(() => {
        const updatedProducts = allcourses.filter(product => !selectedIds.includes(product.id));
        this.setState({
          allcourses: updatedProducts,
          selectedCourseList: [],
          selectedCourse: null,
        });
        if(this.toast.current && selectedCourseName.length>0){
          this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Course Deleted', life: 6000 });
        }
      })
      .catch(err => {
        if(this.toast.current){
        this.toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete course', life: 6000 });
        }
        console.error(err);
      });

  };

  saveProduct = () => {
    this.setState({ submitted: true });

    const { product } = this.state; // Access product from state
    if (product.cardnumber.trim() && product.coursename.trim()) {
      let _data = [...this.state.data]; // Using the data from state
      let _product = { ...product };

      if (product.id) {
        const index = _data.findIndex(item => item.id === product.id);

        if (index !== -1) {
          _data[index] = _product;
          this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 6000 });
        }
      } else {
        _product.id = new Date().getTime(); // Use a simple ID generation method
        _data.push(_product);
        this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 6000 });
      }

      this.addRowToDatabase(_product);

      this.setState({ data: _data, productDialog: false, product: this.emptyProduct() });
    }
  };

  saveAdmin = () => {
    this.setState({ submitted: true });

    let { addAdmin } = this.state; //
    if (addAdmin.username.trim() && addAdmin.email.trim() && addAdmin.firstname.trim() && addAdmin.lastname.trim()) {
      let _data = [...this.state.courseadmin];
      let getUsername = addAdmin.username;
      let getCourseAdmin = this.state.courseadmin;
      let getAllAdmin = this.state.alladmin;
      let checkDuplicateUsers = [];
      let checkDuplicateOtherCourseUsers = [];

      if (getCourseAdmin.length > 0) {
       for (let r = 0; r < getCourseAdmin.length; r++) {
        if (getCourseAdmin[r].username === getUsername) {
         checkDuplicateUsers.push(getCourseAdmin[r].username);
        }
       }
      }

      if (getAllAdmin.length > 0) {
       for (let y = 0; y < getAllAdmin.length; y++) {
        if (getAllAdmin[y].username === getUsername) {
         checkDuplicateOtherCourseUsers.push(getAllAdmin[y].username);
        }
       }
      }

      if(checkDuplicateUsers && checkDuplicateUsers.length > 0){
       this.toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Duplicated Users', life: 6000 });
       return;
      }else{
        this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Admin Created', life: 6000 });

        let _product = { ...addAdmin };

        _product.id = new Date().getTime();
        _data.push(_product);

        if(checkDuplicateOtherCourseUsers && checkDuplicateOtherCourseUsers.length > 0){
         this.updateSingleAdminToDatabase(_product);
        }else{
         this.addSingleAdminToDatabase(_product);
        }

        this.setState({ courseadmin: _data, addAdmin: this.emptyAdmin() });
        this.setState({ submitted: false });

      }

    }
  };

  saveCourse = () => {
    this.setState({ submitted: true });

    let { addCourse } = this.state;

    // Ensure coursename is always an array before calling every()
    if (Array.isArray(addCourse.coursename) && addCourse.coursename.every(course => course.trim())) {
        let getCourseName = addCourse.coursename;
        let getAllAdmin = this.state.alladmin;
        let checkDuplicateCourses = [];

        if (Array.isArray(getAllAdmin) && getAllAdmin.length > 0) {
            for (let r = 0; r < getAllAdmin.length; r++) {
                let getAdminCourse = getAllAdmin[r].coursename;

                // Ensure getAdminCourse is an array before using forEach()
                if (Array.isArray(getAdminCourse)) {
                    getAdminCourse.forEach(course => {
                        if (getCourseName.some(name => name.toLowerCase() === course.toLowerCase())) {
                            checkDuplicateCourses.push(course);
                        }
                    });
                }
            }
        }


        if (checkDuplicateCourses.length > 0) {
            this.toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Duplicated Course', life: 6000 });
            return;
        } else {
            this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Course Added', life: 6000 });

            let _product = { ...addCourse };
            _product.id = new Date().getTime();

            this.addSingleCourseToDatabase(_product);

            this.setState({ addCourse: this.emptyCourse(), submitted: false });
        }
    }
  };

  saveSingleStudent = () => {
    this.setState({ submitted: true });
    let { uploadsingledata } = this.state; // Access product from state
    if (uploadsingledata.cardnumber.trim() && uploadsingledata.coursename.trim()) {
      let _data = [...this.state.data]; // Using the data from state
      let getCardNumber = String(uploadsingledata.cardnumber);
      this.setState((prevState) => ({
       uploadsingledata: {
        ...prevState.uploadsingledata,
       cardnumber: getCardNumber
       }
      }));

      let getAllStudents = this.state.allstudents;
      let checkDuplicateUsers = [];

      if (getAllStudents.length > 0) {
       for (let r = 0; r < getAllStudents.length; r++) {
        let studentCardNumber = String(getAllStudents[r].cardnumber);
        if (studentCardNumber === getCardNumber) {
         checkDuplicateUsers.push(studentCardNumber);
        }
       }
      }

      if(checkDuplicateUsers && checkDuplicateUsers.length > 0){
       this.toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Duplicated Card Number', life: 6000 });
       return;
      }else{
        this.toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Student Created', life: 6000 });

        let _product = { ...uploadsingledata };

        _product.id = new Date().getTime(); // Use a simple ID generation method
        _data.push(_product);

        this.addSingleRowToDatabase(_product);

        this.setState({ data: _data, uploadsingledata: this.emptyProduct() });
        this.setState({ submitted: false });

      }

    }
  };

  leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
    </div>
  );

  rightToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      {/* <Button label="Export Current Display" icon="pi pi-upload" className="p-button-help" onClick={() => this.dt.current.exportCSV()}/> */}
      <Button
        label="Add Admin"
        onClick={this.showAdminModal}
        severity="warning"
        style={{ marginRight: '20px' }} 
      />
     <Button
      label="Add Course"
      onClick={this.showCreateCourseModal}
      severity="warning"
     />
    </div>
  );

  exportFullData = () => {
   const originalValue = this.dt.current.props.value;
   this.dt.current.props.value = this.state.data;
   this.dt.current.exportCSV();
   this.dt.current.props.value = originalValue;
  };

  onRowEditComplete = (e) => {
    const { newData, index } = e;
    const updatedData = [...this.state.data];
    updatedData[index] = newData;

    this.setState({ data: updatedData });
    this.saveRowToDatabase(newData);
  };

  saveRowToDatabase = (data) => {
    axios.post(`http://localhost:8080/api/manage/update`, { data })
      .then(() => this.getCardInfo(this.state.selectedCourse))
      .catch((err) => console.error(err));
  };

  addRowToDatabase = (data) => {
    axios.post(`http://localhost:8080/api/manage/add`, { data })
      .then(() => this.getCardInfo(this.state.selectedCourse))
      .catch((err) => console.error(err));
  };

  addSingleRowToDatabase = (data) => {
    axios.post(`http://localhost:8080/api/users/add`, { data })
      .then(() => {
        this.getCardInfo(this.state.selectedCourse);
      })
      .catch((err) => console.error(err));
  };

  addSingleAdminToDatabase = async (data) => {
   try {
    await axios.post(`http://localhost:8080/api/users/addadmin`, { data });
    await this.getAllAdmin(this.props.username);
   } catch (err) {
    console.error(err);
   }
  };

  updateSingleAdminToDatabase = async (data) => {
   try {
    await axios.post(`http://localhost:8080/api/users/updateadmin`, { data });
    await this.getAllAdmin(this.props.username);
   } catch (err) {
    console.error(err);
   }
  };

  addSingleCourseToDatabase = async (data) => {
   try {
    await axios.post(`http://localhost:8080/api/users/addcourse`, { data });
    await this.getAllAdmin(this.props.username);
   } catch (err) {
    console.error(err);
   }
  };

  deleteRowStudentListDatabase = (data) => {
    return axios.post(`http://localhost:8080/api/users/delete`, { data })
      .then(() => {
        this.getCardInfo(this.state.selectedCourse);
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  deleteRowAdminListDatabase = async (data) => {
   try {
    await axios.post(`http://localhost:8080/api/users/delete`, { data });
    await this.getAllAdmin(this.props.username);
   } catch (err) {
    console.error(err);
   }
  };

  deleteRowCourseListDatabase = async (data) => {
   try {
    await axios.post(`http://localhost:8080/api/users/deletecourse`, { data });
    await this.getAllAdmin(this.props.username);
   } catch (err) {
    console.error(err);
   }
  };

  deleteRowCourseOwnerDatabase = async (data) => {
   try {
    await axios.post(`http://localhost:8080/api/users/deleteowner`, { data });
    await this.getAllAdmin(this.props.username);
   } catch (err) {
    console.error(err);
   }
  };

  productDialogFooter = () => (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={this.hideDialog} className="mr-2"/>
      <Button label="Save" icon="pi pi-check" onClick={this.saveProduct} />
    </React.Fragment>
  );

  uploadSingleDialogFooter = () => (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={this.hideUploadSingleDialog} className="mr-2"/>
    </React.Fragment>
  );

  onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _product = { ...this.state.product }; 
    _product[`${name}`] = val;
    this.setState({ product: _product });
  };

  onInputAdminChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _product = { ...this.state.addAdmin }; 
    let getCourse = [];
    _product[`${name}`] = val;
    _product['userlevel'] = "admin";
    getCourse.push(this.state.selectedCourse);
    _product['coursename'] = getCourse;
    this.setState({ addAdmin: _product });
  };

  onInputCourseChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _product = { ...this.state.addCourse }; 
    let getCourse = [];
    _product['username'] = this.props.username;
    getCourse.push(val);
    _product['coursename'] = getCourse;
    this.setState({ addCourse: _product });
  };

  onInputUploadChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let date = moment(new Date()).tz("America/Toronto").format("YYYY-MM-DD");
    let _product = { ...this.state.uploadsingledata }; 
    _product[`${name}`] = val;
    _product['uploaddate'] = date;
    _product['coursename'] = this.state.selectedCourse;
    this.setState({ uploadsingledata: _product });
  };

  onInputDateCourseChange = (e) => {
    let val = (e.target && e.target.value) || '';
    let date = moment(val).tz("America/Toronto").format("YYYY-MM-DD");
    let _product = { ...this.state.product }; 
    _product['date'] = date;
    _product['coursename'] = this.state.selectedCourse;
    _product['verified'] = true;
    this.setState({ product: _product });
  };

  onDateChange = (e) => {
   const val = (e.target && e.target.value) || '';
   if (!val || val === 'All') {
    if(this.state.absenceChecked===true){
     const filteredData = this.state.backupdata.filter((item) => item.status === "absent");
     this.setState({
      selectedDate: val,
      data: filteredData,
      rowsPerPageOptions: this.calculateRowsPerPageOptions(filteredData.length),
     });
    }else if(this.state.presentChecked===true){
     const filteredData = this.state.backupdata.filter((item) => item.status === "present");
     this.setState({
      selectedDate: val,
      data: filteredData,
      rowsPerPageOptions: this.calculateRowsPerPageOptions(filteredData.length),
     });
    }else{
      this.setState({
      selectedDate: 'All',
      data: this.state.backupdata,
      rowsPerPageOptions: this.calculateRowsPerPageOptions(this.state.backupdata.length),
     });
    }
   }else{
    if(this.state.absenceChecked===true){
     const filteredData = this.state.backupdata.filter((item) => item.date === val && item.status === "absent");
     this.setState({
      selectedDate: val,
      data: filteredData,
      rowsPerPageOptions: this.calculateRowsPerPageOptions(filteredData.length),
     });
    }else if(this.state.presentChecked===true){
     const filteredData = this.state.backupdata.filter((item) => item.date === val && item.status === "present");
     this.setState({
      selectedDate: val,
      data: filteredData,
      rowsPerPageOptions: this.calculateRowsPerPageOptions(filteredData.length),
     });
    }else{
     const filteredData = this.state.backupdata.filter((item) => item.date === val);
     this.setState({
      selectedDate: val,
      data: filteredData,
      rowsPerPageOptions: this.calculateRowsPerPageOptions(filteredData.length),
     });
    }
   }
  };

  onUpload = (event) => {
   const uploadedFiles = event.files; 
   if(uploadedFiles && uploadedFiles.length > 0){
    const xlsxFile = uploadedFiles[0];
    this.onFileReady(xlsxFile);
   }else{
    this.toast.current.show({
      severity: 'warn',
      summary: 'Warning',
      detail: 'No file selected!',
      life: 3000
    });
   }
  };

  onFileReady(xlsxfile){

    readXlsxFile(xlsxfile).then((rows, errors) => {
     const date = moment(new Date()).tz("America/Toronto").format("YYYY-MM-DD");
     if (rows.length === 0) {
      this.toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Empty file uploaded!',
        life: 3000
      });
      return;
     }

     let getFilterFile = rows;
     let getFinalData = [];

        if(getFilterFile.length > 0){
          getFilterFile = getFilterFile.filter((thing, index, self) => index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(thing)));
          let getAllData = this.state.backupdata;
          let checkDuplicateUsers = [];
          if(getAllData.length > 0 && getFilterFile.length > 0){
           for (var r = 0; r < getAllData.length; r++) {
            for (var v = 0; v < getFilterFile.length; v++) {
               if(String(getAllData[r].cardnumber) === String(getFilterFile[v])){
                  checkDuplicateUsers.push(getAllData[r].cardnumber)
               }
            }   
          }
        }

        if(checkDuplicateUsers.length > 0){
            for(var s1 = 0; s1 < getFilterFile.length; s1++) {
              for(var r1 = 0; r1 < checkDuplicateUsers.length; r1++) {
                 if(String(getFilterFile[s1]) === String(checkDuplicateUsers[r1])){
                    let getIndex = getFilterFile.indexOf(getFilterFile[s1]);
                     if (getIndex > -1) {
                       getFilterFile.splice(getIndex, 1);
                    }
                 }
              }
           }
        }

        if (getFilterFile.length > 0) {
          for (let x = 0; x < getFilterFile.length; x++) {

            let getCardNumber = String(getFilterFile[x]);

            getFinalData.push({
             cardnumber: getCardNumber,
             uploaddate: date,
             coursename: this.state.selectedCourse,
            });
          }
        }

        this.setState({uploaddata: getFinalData});

        }
    })
  } 

  submitUploadData = () => {
    const errors = this.validate(this.state.uploaddata);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.props.eligibleUploadSubmit(this.state.uploaddata);
       this.toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
       this.setState({ uploadDialog: false });
       this.getCardInfo(this.state.selectedCourse);
    }
  }; 

  validate = data => {
    const errors = {};
    if (Object.keys(data).length === 0) errors.file = "Can't be blank";
    return errors;
  };

  textEditor = (options) => (
    <InputText
      type="text"
      value={options.value}
      onChange={(e) => options.editorCallback(e.target.value)}
    />
  );

  onCourseChange = async (e) => {
    const val = (e.target && e.target.value) || '';
    this.setState({ courseadmin: [] });
    this.setState({ selectedCourse: val });
    this.getCardInfo(val);
    await this.getAllAdmin(this.props.username);
  };

  renderHeader() {
    return (
     <div> 
      <div className="flex align-items-center justify-content-between">
        <div className="toTheLeft">
        <h4 className="makeBold">Manage Students</h4>
        <br/>
        <Dropdown value={this.state.selectedDate} onChange={this.onDateChange} options={this.state.dropdownDate} optionLabel="name" placeholder="Select Course Date" 
        filter showClear className="w-full md:w-16rem cstmSizeDropDownDate" />
         <br/><br/>
         <Checkbox
          onChange={this.onAbsenceCheckboxChange}
          checked={this.state.absenceChecked}
         />
         <label className="ml-2">Absent</label>
         <Checkbox
         onChange={this.onPresentCheckboxChange}
         checked={this.state.presentChecked}
         style={{ marginLeft: '15px' }}
         />
         <label className="ml-2">Present</label>
        </div>
        <div className="toTheRight">
        <br/>
         <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search..."
            onInput={(e) => this.setState({ globalFilter: e.target.value })}
            className="cstmSizeSearchBar"
          />
         </IconField>
        </div>
      </div>
      {this.state.data &&
        (
        <div>
          <br/>
          <p className="toTheLeft">{this.state.data.length} in total</p>
          <Button
          label="Export"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={this.exportFullData}
          severity="help"
          className="toTheRight"
         />
         <br/><br/>
        </div>
        )}
     </div> 
    );
  }

  renderStudent() {
    return (
     <div className="flex align-items-center justify-content-between"> 
      <div className="toTheLeft">
        <h4 className="makeBold">Class List</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
         <Button
         label="Delete"
         icon="pi pi-trash"
         severity="danger"
         onClick={this.deleteSelectedStudentList}
         />
         <Button
         label="Export"
         icon="pi pi-upload"
         className="p-button-help"
         onClick={() => this.sl.current.exportCSV()}
         />
        </div>
      </div>
      <div className="toTheRight">
        <IconField iconPosition="left" style={{ marginTop: '30px' }}>
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search..."
            onInput={(e) => this.setState({ globalFilterStudent: e.target.value })}
          />
        </IconField>
      </div><br/><br/>
     </div> 
    );
  }

  renderAdmin() {
    return (
     <div className="flex align-items-center justify-content-between"> 
      <div className="toTheLeft">
        <h4 className="makeBold">Admin List</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
         <Button
         label="Delete"
         icon="pi pi-trash"
         severity="danger"
         onClick={this.deleteSelectedAdminList}
         />
         <Button
         label="Export"
         icon="pi pi-upload"
         className="p-button-help"
         onClick={() => this.ad.current.exportCSV()}
         />
        </div>
      </div>
      <div className="toTheRight">
        <IconField iconPosition="left" style={{ marginTop: '30px' }}>
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search..."
            onInput={(e) => this.setState({ globalFilterAdmin: e.target.value })}
          />
        </IconField>
      </div><br/><br/>
     </div> 
    );
  }

  renderCourseList() {
    return (
     <div className="flex align-items-center justify-content-between"> 
      <div className="toTheLeft">
        <h4 className="makeBold">Course List</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
         <Button
         label="Delete"
         icon="pi pi-trash"
         severity="danger"
         onClick={this.deleteSelectedCourseList}
         />
         <Button
         label="Export"
         icon="pi pi-upload"
         className="p-button-help"
         onClick={() => this.cl.current.exportCSV()}
         />
        </div>
      </div>
      <div className="toTheRight">
        <IconField iconPosition="left" style={{ marginTop: '30px' }}>
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search..."
            onInput={(e) => this.setState({ globalFilterCourseList: e.target.value })}
          />
        </IconField>
      </div><br/><br/>
     </div> 
    );
  } 

  onAbsenceCheckboxChange = (e) => {
    const { backupdata = [], selectedDate } = this.state;
    let filteredData = [];

    if (e.checked) {
    filteredData = selectedDate === null || selectedDate === 'All'
      ? backupdata.filter((item) => item.status === "absent")
      : backupdata.filter((item) => item.status === "absent" && item.date === selectedDate);
    }else{
    filteredData = selectedDate === null || selectedDate === 'All'
      ? backupdata
      : backupdata.filter((item) => item.date === selectedDate);
    }

    const dataLength = filteredData.length;
    const rowsPerPageOptions = this.calculateRowsPerPageOptions(dataLength);

    this.setState({ data: filteredData, absenceChecked: e.checked, presentChecked: false, rowsPerPageOptions });
  }

  onPresentCheckboxChange = (e) => {
   const { backupdata = [], selectedDate } = this.state;
   let filteredData = [];

   if (e.checked) {
    filteredData = selectedDate === null || selectedDate === 'All'
      ? backupdata.filter((item) => item.status === "present")
      : backupdata.filter((item) => item.status === "present" && item.date === selectedDate);
    }else{
    filteredData = selectedDate === null || selectedDate === 'All'
      ? backupdata
      : backupdata.filter((item) => item.date === selectedDate);
    }

    const dataLength = filteredData.length;
    const rowsPerPageOptions = this.calculateRowsPerPageOptions(dataLength);

    this.setState({ data: filteredData, presentChecked: e.checked, absenceChecked: false, rowsPerPageOptions });
  }

  verifiedStatusTemplate = (rowData) => {
   return (
    <div>
      {rowData.status === "present" ? (
        <div>
         <i className="pi pi-verified"></i>
        <span>{rowData.status}</span>
        </div>
      ) : rowData.status === "absent" ? (
        <div>
         <i className="pi pi-times-circle"></i>
           <span>{rowData.status}</span>
        </div>
      ): null}
    </div>
   );
  };

  render() {
    const { data, students, allstudents, uploaddata, uploadsingledata, first, rows, rowsPerPageOptions, globalFilter, globalFilterStudent, selectedStudentList, productDialog, uploadDialog, uploadSingleDialog, product, submitted, dropdownCourse, selectedCourse, addAdminDialog, addAdmin, addCourseDialog, addCourse, courseadmin, allcourses, globalFilterAdmin, globalFilterCourseList, selectedAdminList, selectedCourseList } = this.state;

    return (
      <div className="flex flex-wrap">
        <div className="m-4 mr-2 pl-2">

          <div className="formgrid grid">
              <div className="field">
               <Tag style={{background: 'white'}}>
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
                    <div className="col-12 px-4 py-4">
                       <p style={{ color: 'black', fontWeight: 'bold', fontSize: '14px' }}>Would you like to add a course?</p>
                       <Button
                       label="Add Course"
                       onClick={this.showCreateCourseModal}
                       severity="help"
                       style={{ fontSize: '14px' }}
                       />
                    </div>
                  </div>
                 )}
                </Tag>
              </div>
          </div>

          {selectedCourse && 
          (
          <div className="formgrid grid">
            <div className="field col-12">
              <Toast ref={this.toast} />
              <Card>
                <div className="toTheRight">
                 <Button
                  label="Upload Class List"
                  onClick={this.showUploadModal}
                  style={{ marginRight: '20px' }} 
                 />
                 <Button
                  label="Add Student"
                  onClick={this.showUploadSingleModal}
                 />
                </div>
                {students && students.length > 0 && 
                 (
                  <div className="toTheRight" style={{ marginRight: '20px' }} >
                   <Button
                   label="Report"
                   severity="warning"
                   onClick={this.showReportModal}
                   />
                  </div>
                 )}
                <br/><br/><br/>
                <Toolbar className="mb-4" left={this.leftToolbarTemplate} right={this.rightToolbarTemplate} />
                <DataTable
                  ref={this.dt}
                  value={data.slice(first, first + rows)}
                  dataKey="id"
                  paginator
                  rows={rows}
                  globalFilter={globalFilter}
                  header={this.renderHeader()}
                  emptyMessage="No records found"
                >
                  <Column field="cardnumber" header="Card Number" editor={(options) => this.textEditor(options)} sortable />
                  <Column field="date" header="Date" editor={(options) => this.textEditor(options)} sortable />
                  <Column field="coursename" header="Course Name" editor={(options) => this.textEditor(options)} sortable />
                  <Column field="status" header="Status" editor={(options) => this.textEditor(options)} bodyClassName="text-center" body={this.verifiedStatusTemplate} sortable/>
                </DataTable>
                <Paginator
                  first={first}
                  rows={rows}
                  totalRecords={data.length}
                  rowsPerPageOptions={rowsPerPageOptions}
                  onPageChange={this.onPageChange}
                />
              </Card>
            </div>
          </div>
          )}

          <Dialog 
            visible={productDialog} 
            style={{ width: '32rem' }} 
            breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
            header="Card Information" 
            modal 
            className="p-fluid" 
            footer={this.productDialogFooter} 
            onHide={this.hideDialog}
          >
            <div className="field">
              <label htmlFor="cardnumber" className="font-bold">
                Card Number
              </label>
              <InputText 
                id="cardnumber" 
                value={product.cardnumber} 
                onChange={(e) => this.onInputChange(e, 'cardnumber')} 
                required 
                autoFocus 
                className={submitted && !product.cardnumber ? 'p-invalid' : ''} 
              />
              {submitted && !product.cardnumber && <small className="p-error">Card Number is required.</small>}
            </div>
            <div className="field">
              <label htmlFor="date" className="font-bold">
                Date
              </label>
              <Calendar value={this.state.selectedAddDate} onChange={this.onInputDateCourseChange} required />
              {submitted && !this.state.selectedAddDate && <small className="p-error">Date is required.</small>}
            </div>
            <div className="field">
              <label htmlFor="coursename" className="font-bold">
                Course Name
              </label>
              <InputText 
                id="coursename" 
                value={selectedCourse}
                disabled 
              />
            </div>
          </Dialog>

          <Dialog 
            visible={uploadDialog} 
            style={{ width: '50vw' }} 
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            header="Upload Class List" 
            modal 
            className="p-fluid" 
            onHide={this.hideUploadDialog}
          >
            <div className="field">
             <div className="surface-overlay border-round border-1 p-1 m-1 w-12rem min-h-full">
              <a href="https://www.eng.uwo.ca/itg/files/sample-card-number-list.xlsx" className="textColorBold no-underline hover:underline mousePoint" aria-hidden={false} tabIndex={0}>Click here to use a sample xlsx file!</a><br/><br/>
             </div>
             <br/>
             <Toast ref={this.toast}></Toast>
             <FileUpload mode="basic" name="file" accept=".xlsx" maxFileSize={1000000} customUpload uploadHandler={this.onUpload} auto chooseLabel="Upload xlsx file" />
             {uploaddata.length > 0 && 
              (
              <div>
                <br/>
                <Button
                  label="Submit"
                  onClick={this.submitUploadData}
                  className="toTheRight"
                />
              </div>
             )}
             <br/><br/>
              <div className="field col-12">
               <DataTable ref={this.sl} value={allstudents} showGridlines tableStyle={{ minWidth: '50rem' }} header={this.renderStudent()} globalFilter={globalFilterStudent} dataKey="id" 
                selection={selectedStudentList} onSelectionChange={(e) => this.setState({ selectedStudentList: e.value })} emptyMessage="You haven't uploaded Class List yet!">
                <Column selectionMode="multiple" exportable={false} />
                <Column field="cardnumber" header="Card Number" sortable></Column>
                <Column field="uploaddate" header="Upload Date" sortable></Column>
                <Column field="coursename" header="Course Name" sortable></Column>
               </DataTable>
             </div>
            </div>
          </Dialog>

          <Dialog 
            visible={uploadSingleDialog} 
            style={{ width: '50vw' }} 
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            header="Add Student" 
            modal 
            className="p-fluid" 
            onHide={this.hideUploadSingleDialog}
            footer={this.uploadSingleDialogFooter} 
          >

            <div className="field">
             <Toast ref={this.toast}></Toast>
            </div>

            <div className="field col-3">
              <label htmlFor="cardnumber" className="font-bold">
                Card Number
              </label>
              <InputText 
                id="cardnumber" 
                value={uploadsingledata.cardnumber} 
                onChange={(e) => this.onInputUploadChange(e, 'cardnumber')} 
                required 
                autoFocus 
                className={submitted && !uploadsingledata.cardnumber ? 'p-invalid' : ''} 
              />
              {submitted && !uploadsingledata.cardnumber && <small className="p-error">Card Number is required.</small>}
            </div>
            <div className="field col-2">
               <Button label="Add" icon="pi pi-check" onClick={this.saveSingleStudent} />
            </div>
            <br/><br/>
              <div className="field col-12">
               <DataTable ref={this.sl} value={allstudents} showGridlines tableStyle={{ minWidth: '50rem' }} header={this.renderStudent()} globalFilter={globalFilterStudent} dataKey="id" 
                selection={selectedStudentList} onSelectionChange={(e) => this.setState({ selectedStudentList: e.value })} emptyMessage="You haven't uploaded Class List yet!">
                <Column selectionMode="multiple" exportable={false} />
                <Column field="cardnumber" header="Card Number" sortable></Column>
                <Column field="uploaddate" header="Upload Date" sortable></Column>
                <Column field="coursename" header="Course Name" sortable></Column>
               </DataTable>
             </div>

          </Dialog>

          <Dialog 
            visible={addAdminDialog} 
            style={{ width: '50vw' }} 
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            header="Add Admin" 
            modal 
            className="p-fluid" 
            onHide={this.hideAdminDialog}
            footer={this.addAdminDialogFooter} 
          >
            <div className="field">
             <Toast ref={this.toast}></Toast>
            </div>
            <div className="field col-3">
              <label htmlFor="username" className="font-bold">
                Username
              </label>
              <InputText 
                id="username" 
                value={addAdmin.username} 
                onChange={(e) => this.onInputAdminChange(e, 'username')} 
                required 
                autoFocus 
                className={submitted && !addAdmin.username ? 'p-invalid' : ''} 
              /><br/><br/>
              <label htmlFor="email" className="font-bold">
                Email
              </label>
              <InputText 
                id="email" 
                value={addAdmin.email} 
                onChange={(e) => this.onInputAdminChange(e, 'email')} 
                required 
                autoFocus 
                className={submitted && !addAdmin.email ? 'p-invalid' : ''} 
              /><br/><br/>
              <label htmlFor="firstname" className="font-bold">
                First Name
              </label>
              <InputText 
                id="firstname" 
                value={addAdmin.firstname} 
                onChange={(e) => this.onInputAdminChange(e, 'firstname')} 
                required 
                autoFocus 
                className={submitted && !addAdmin.firstname ? 'p-invalid' : ''} 
              /><br/><br/>
              <label htmlFor="lastname" className="font-bold">
                Last Name
              </label>
              <InputText 
                id="lastname" 
                value={addAdmin.lastname} 
                onChange={(e) => this.onInputAdminChange(e, 'lastname')} 
                required 
                autoFocus 
                className={submitted && !addAdmin.lastname ? 'p-invalid' : ''} 
              />
              {submitted && !addAdmin.username && <small className="p-error">Username is required.</small>}
              {submitted && !addAdmin.email && <small className="p-error">Email is required.</small>}
              {submitted && !addAdmin.firstname && <small className="p-error">First name is required.</small>}
              {submitted && !addAdmin.lastname && <small className="p-error">Last name is required.</small>}
            </div>
            <div className="field col-2">
               <Button label="Add" icon="pi pi-check" onClick={this.saveAdmin} />
            </div>
            <br/><br/>
              <div className="field col-12">
               <DataTable ref={this.ad} value={courseadmin} showGridlines tableStyle={{ minWidth: '50rem' }} header={this.renderAdmin()} globalFilter={globalFilterAdmin} dataKey="id" 
                selection={selectedAdminList} onSelectionChange={(e) => this.setState({ selectedAdminList: e.value })} emptyMessage="You haven't added Admin yet!">
                <Column selectionMode="multiple" exportable={false} />
                <Column field="username" header="Username" sortable></Column>
                <Column field="email" header="Email" sortable></Column>
                <Column field="firstname" header="First Name" sortable></Column>
                <Column field="lastname" header="Last Name" sortable></Column>
               </DataTable>
             </div>
          </Dialog>

          <Dialog 
            visible={addCourseDialog} 
            style={{ width: '50vw' }} 
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
            header="Add Course" 
            modal 
            className="p-fluid" 
            onHide={this.hideCreateCourseModal}
          >
            <div className="field">
             <Toast ref={this.toast}></Toast>
            </div>
            <div className="field col-3">
              <label htmlFor="coursename" className="font-bold">
                Course Name
              </label>
              <InputText 
                id="coursename" 
                value={addCourse.coursename} 
                onChange={(e) => this.onInputCourseChange(e, 'coursename')} 
                required 
                autoFocus 
                className={submitted && !addCourse.coursename ? 'p-invalid' : ''} 
              /><br/><br/>
              {submitted && !addCourse.coursename && <small className="p-error">Course name is required.</small>}
            </div>
            <div className="field col-2">
               <Button label="Add" icon="pi pi-check" onClick={this.saveCourse} />
            </div>
            <br/><br/>
              <div className="field col-12">
               <DataTable ref={this.cl} value={allcourses} showGridlines tableStyle={{ minWidth: '50rem' }} header={this.renderCourseList()} globalFilter={globalFilterCourseList} dataKey="id" 
                selection={selectedCourseList} onSelectionChange={(e) => this.setState({ selectedCourseList: e.value })} emptyMessage="No course!">
                <Column selectionMode="multiple" exportable={false} />
                <Column field="coursename" header="Course Name" sortable></Column>
                <Column field="courseowner" header="Course Owner" sortable></Column>
               </DataTable>
             </div>
          </Dialog>

        </div>
      </div>
    );
  }
}

Manage.propTypes = {
  coursename: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  eligibleUploadSubmit: PropTypes.func.isRequired,
  //fetchStudents: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  coursename: state.user.coursename,
  username: state.user.username,
  //students: allStudentsSelector(state)
});

export default connect(mapStateToProps, { eligibleUploadSubmit })(Manage);
