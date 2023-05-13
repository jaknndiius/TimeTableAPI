'use strict'
export class ClassTimeList {
  constructor(start, end, maxClass) {
    this.currentClass = 1;
    this.maxClass = maxClass;
    this.classTimes = {
      start,
      end,
      other: []
    };
  }
  getDuration(previousTime, currentTime) {
    return (currentTime[0] -previousTime[0])*60 +currentTime[1] -previousTime[1];
  }
  checkOrder() {
    return this.get().map(time => time[2]).every(duration => duration >= 0);
  }
  addClassTime(hours, minutes) {
    if(this.classTimes.other.length < this.maxClass)
      this.classTimes.other.push([hours, minutes]);
    else
      throw new Error('Class time is already max size.');

    if(!this.checkOrder()) throw new Error('Invalid class time order. Class times should be in chronological order.');
  }
  getElapsedTime(fromHour, fromMinute, toHour, toMinute) {
    return ((toHour-fromHour)*60) +toMinute -fromMinute;
  }
  get() {
    const times = [];
    const durations = [];
    times.push([...this.classTimes.start]);
    for(const time of Object.values(this.classTimes.other)) {
      const pre = times[times.length-1];
      durations.push(this.getDuration(pre, time))
      times.push([...time]);
    }
    durations.push(this.getDuration(times[times.length-1], this.classTimes.end))
    durations.push(0);
    times.push([...this.classTimes.end]);
    for(let i=0;i<times.length;i++) {
      times[i].push(durations[i]);
    }
    return times;
  }
  getCurrent(hours, minutes) {
    let returnIndex = -1;
    this.get().forEach(([startHour, startMinutes, duration], index) => {
      const pre = this.getElapsedTime(startHour, startMinutes, hours, minutes);
      if(pre >=0 && pre < duration) returnIndex = index;
    });
    return returnIndex;
  }
  getCurrentClass({hours, minutes}) {
    const idx = this.getCurrent(hours, minutes);
    return (idx == 0) ? 1 : idx;
  }
}
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
    this.classTime = null;
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
  static getClassTime() {
    return Setting.getInstance().classTime;
  }
  static getCSAT() {
    return Setting.getInstance().CSAT;
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
  static setClassTime(classTime) {
    Setting.getInstance().classTime = classTime;
  }
  static setCSAT(csatDay) {
    Setting.getInstance().CSAT = new Date(csatDay);
  } 
}
export const Day = { MONDAY: 0, THEUSDAY: 1, WEDNESDAY: 2, THURSDAY: 3, FIRDAY: 4 };

export const SelfStudy = Symbol('selfStudy');

import { load } from './timeTable.js'
export const loadPage = load;