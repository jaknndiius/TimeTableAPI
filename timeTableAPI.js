'use strict'
export class ExamAttribute {
  constructor(selective, descriptive) {
    this.selective = selective;
    this.descriptive = descriptive;
    this.ranges = [];
  }
  addRange(range) { 
    this.ranges.push(range);
    return this;
  }
}
export class Subject {
  constructor(subjectName, teacher) {
    this.subjectName = subjectName;
    this.teacher = teacher;
  }
  toString() {
    return this.subjectName;
  }
  setExam(examAttribute) {
    this.examAttribute = examAttribute;
  }
}
class MultipleSubject extends Subject {
  constructor(subjectName, teacher, suffix, fullName) {
    super(subjectName, teacher);
    this.suffix = suffix;
    this.fullName = fullName;
  }
  toString() { return ((this.fullName) ? this.subjectName : this.subjectName[0]) + this.suffix; }
}
export const SuffixType = {
  NUMBER: [1, 2, 3, 4, 5],
  ALPABET: ['A', 'B', 'C', 'D', 'E'],
  ROMAN: ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ']
}
export class SubjectList {
  constructor(subjectName, teachers, options={}) {

    const suffixType = options.suffixType || SuffixType.NUMBER;
    const fullName = options.fullName || false;
    const subjects = teachers.map(
      (teacher, index) => new MultipleSubject(subjectName, teacher, suffixType[index], fullName));
      
    const listFunction = order => subjects[order-1];
    listFunction.toString = () => subjectName;
    listFunction.setExam = function(examAttribute) {
      this.examAttribute = examAttribute;
    };
    return listFunction;
  }
}
class Exams {
  constructor(month, date) {
    this.day = new Date(`${new Date().getFullYear()}/${month}/${date}`);
  }
  setSubjects(...subjects) {
    this.subjects = subjects;
    return this;
  }
}
class SubjectGroup {
  constructor(...subjects) {
    this.subjects = subjects;
  }
  setToRegularSchedule(day) {
    Setting.addSubjectsToSchedule(day, this.subjects);
  }
  setToExamSchedule(month, date) {
    Setting.addExams(month, date, this.subjects);
  }
}
export class Setting {
  constructor() {
    if(Setting.instance) throw new Error('alreay instantiated class.');
    this.mockTests = [];
    this.subjectsByTime = [];
    this.examList = [];
    this.classTimes = new Array(8);
    Setting.instance = this;
  }
  static getInstance() {
    if(!this.instance) this.instance = new Setting();
    return this.instance;
  }
  static getMoakTests() {
    return Setting.getInstance().mockTests;
  }
  static getSubjectsByTime() {
    return Setting.getInstance().subjectsByTime;
  }
  static getExamList() {
    return Setting.getInstance().examList;
  }
  static getClassTimes() {
    return Setting.getInstance().classTimes;
  }
  static addMoakTest(dateFormat) {
    Setting.getInstance().mockTests.push(new Date(dateFormat));
  }
  static group(...subjects) {
    return new SubjectGroup(...subjects);
  }
  static addSubjectsToSchedule(day, subjects) {
    Setting.getInstance().subjectsByTime[day] = subjects;
  }
  static addExams(month, date, subjects) {
    Setting.getInstance().examList.push(
      new Exams(month, date)
        .setSubjects(...subjects)
    );
  }
  static setClassTime(className, hours, minutes) {
    Setting.getInstance().classTimes[className] = [hours, minutes];
  }
}
export const Day = { MONDAY: 0, THEUSDAY: 1, WEDNESDAY: 2, THURSDAY: 3, FIRDAY: 4 };
export const ClassName = { CLASS1: 0 , CLASS2: 1 , CLASS3: 2, CLASS4: 3, LUNCH: 4, CLASS5: 5, CLASS6: 6, CLASS7: 7 };

export const SelfStudy = Symbol('selfStudy');

import { load } from './timeTable.js'
export const loadPage = load;