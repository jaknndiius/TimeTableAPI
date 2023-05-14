interface ClassTimes {
  start: number[];
  end: number[];
  other: Array<number[]>
}
export class ClassTimeList {

  private readonly maxClass: number;
  public readonly classTimes: ClassTimes;

  constructor(start: number[], end: number[], maxClass: number) {
    this.maxClass = maxClass;
    this.classTimes = { start, end, other: [] };
  }
  private getDuration(previousTime: number[], currentTime: number[]): number {
    return (currentTime[0] -previousTime[0])*60 +currentTime[1] -previousTime[1];
  }
  private checkAllIn(): boolean {
    return this.classTimes.other.length == this.maxClass;
  }
  private checkOrder(): boolean {
    return this.get().map(time => time[2]).every(duration => duration >= 0);
  }
  public addClassTime(hours: number, minutes: number) {
    if(this.classTimes.other.length < this.maxClass)
      this.classTimes.other.push([hours, minutes]);
    else
      throw new Error('ClassTime is already max length.');
    if(!this.checkOrder()) throw new Error('Invalid class time order. Class times should be in chronological order.');
  }
  private getElapsedTime(fromHour: number, fromMinute: number, toHour: number, toMinute: number): number {
    return ((toHour-fromHour)*60) +toMinute -fromMinute;
  }
  private get(): Array<number[]> {
    const times: Array<number[]> = [];
    const durations: number[] = [];
    times.push([...this.classTimes.start]);
    for(const time of Object.values(this.classTimes.other)) {
      const prev: number[] = times[times.length-1];
      durations.push(this.getDuration(prev, time));
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
  private getCurrent(hours: number, minutes: number): number {
    let returnIndex = -1;
    this.get().forEach(([startHour, startMinutes, duration], index) => {
      const pre = this.getElapsedTime(startHour, startMinutes, hours, minutes);
      if(pre >=0 && pre < duration) returnIndex = index;
    });
    return returnIndex;
  }
  public getCurrentClass({hours, minutes}: {hours: number, minutes: number}): number {
    if(!this.checkAllIn()) throw new Error(`ClassTime's length must be maxClass(${this.maxClass})`)
    const idx = this.getCurrent(hours, minutes);
    return (idx == 0) ? 1 : idx;
  }
}
export class ExamAttribute {
  public readonly selective: number;
  public readonly descriptive: number;
  public readonly ranges: string[] = [];

  constructor(selective: number, descriptive: number) {
    this.selective = selective;
    this.descriptive = descriptive;
  }
  public addRange(range: string): ExamAttribute { 
    this.ranges.push(range);
    return this;
  }
}
export class Subject {
  public subjectName: string;
  public teacher: string;
  public examAttribute: ExamAttribute | null = null;

  constructor(subjectName: string, teacher: string) {
    this.subjectName = subjectName;
    this.teacher = teacher;
  }
  toString(): string {
    return this.subjectName;
  }
  setExam(examAttribute: ExamAttribute) {
    this.examAttribute = examAttribute;
  }
}
export const SuffixType = {
  NUMBER: [1, 2, 3, 4, 5],
  ALPABET: ['A', 'B', 'C', 'D', 'E'],
  ROMAN: ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ']
}
class MultipleSubject extends Subject {

  private readonly suffix: number | string;
  private readonly fullName: boolean;

  constructor(subjectName: string, teacher: string, suffix: number | string, fullName: boolean) {
    super(subjectName, teacher);
    this.suffix = suffix;
    this.fullName = fullName;
  }
  public toString(): string {
    return ((this.fullName) ? this.subjectName : this.subjectName[0]) + this.suffix;
  }
}
interface Options {
  suffixType: typeof SuffixType[keyof typeof SuffixType],
  fullName: boolean
}
export class SubjectList extends Subject {
  [index: number]: MultipleSubject;
  constructor(subjectName: string, teachers: string[], options: Options = {suffixType: SuffixType.NUMBER, fullName: false}) {
    super(subjectName, '');
    teachers.map(
      (teacher, index) => new MultipleSubject(subjectName, teacher, options.suffixType[index], options.fullName)
    ).forEach((sub, idx) => this[idx+1] = sub);
  }
}
class Exams {
  public readonly day: Date;
  public subjects: Subject[] = [];

  constructor(month: number, date: number) {
    this.day = new Date(`${new Date().getFullYear()}/${month}/${date}`);
  }
  public setSubjects(...subjects: Subject[]): Exams {
    this.subjects = subjects;
    return this;
  }
}
export enum Day {
  MONDAY,
  THEUSDAY,
  WEDNESDAY,
  THURSDAY,
  FIRDAY
}
class SubjectGroup {
  private readonly subjects: Subject[];

  constructor(...subjects: Subject[]) {
    this.subjects = subjects;
  }
  public setToRegularSchedule(day: Day) {
    Setting.addSubjectsToSchedule(day, this.subjects);
  }
  public setToExamSchedule(month: number, date: number) {
    Setting.addExams(month, date, this.subjects);
  }
}
export class Setting {
  private static instance: Setting;

  private constructor() { }

  private static getInstance(): Setting {
    if(!Setting.instance) Setting.instance = new Setting();
    return Setting.instance;
  }

  private readonly mockTests: Date[] = [];
  private readonly subjectsByTime: Array<Subject[]> = [];
  private readonly examList: Exams[] = [];
  private classTime: ClassTimeList | null = null;
  private CSAT: Date | null = null;

  static getMoakTests(): Date[] {
    return Setting.getInstance().mockTests;
  }
  static getSubjectsByTime(): Array<Subject[]> {
    return Setting.getInstance().subjectsByTime;
  }
  static getExamList(): Exams[] {
    return Setting.getInstance().examList;
  }
  static getClassTime(): ClassTimeList | null {
    return Setting.getInstance().classTime;
  }
  static getCSAT(): Date | null {
    return Setting.getInstance().CSAT;
  }
  static addMoakTest(dateFormat: string) {
    Setting.getInstance().mockTests.push(new Date(dateFormat));
  }
  static group(...subjects: Subject[]) {
    return new SubjectGroup(...subjects);
  }
  static addSubjectsToSchedule(day:Day, subjects: Subject[]) {
    Setting.getInstance().subjectsByTime[day] = subjects;
  }
  static addExams(month: number, date: number, subjects: Subject[]) {
    Setting.getInstance().examList.push(
      new Exams(month, date)
        .setSubjects(...subjects)
    );
  }
  static setClassTime(classTime: ClassTimeList) {
    Setting.getInstance().classTime = classTime;
  }
  static setCSAT(csatDay: string) {
    Setting.getInstance().CSAT = new Date(csatDay);
  } 
}
export const SelfStudy = Symbol('selfStudy');

import { load } from './timeTable.js'
export const loadPage = load;