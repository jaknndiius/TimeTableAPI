interface ClassTimes {
  start: number[];
  end: number[];
  other: Array<number[]>
}
export class ClassTimeList {

  private readonly maxClass: number;
  public readonly classTimes: ClassTimes;

  /**
   * **교시 별 시간 설정 객체를 생성합니다**
   *
   * @constructor
   * @param {number[]} start *등교 시간: [hours, minutes]*
   * @param {number[]} end *하교 시간: [hours, minutes]*
   * @param {number} maxClass *교시 수*
   */
  constructor(start: number[], end: number[], maxClass: number) {
    this.maxClass = maxClass;
    this.classTimes = { start, end, other: [] };
  }
  private getDuration(previousTime: number[], currentTime: number[]): number {
    return (currentTime[0] - previousTime[0]) * 60 + currentTime[1] - previousTime[1];
  }
  private checkAllIn(): boolean {
    return this.classTimes.other.length == this.maxClass;
  }
  private checkOrder(): boolean {
    return this.get().map(time => time[2]).every(duration => duration >= 0);
  }
  /**
   * **교시 시작 시간을 추가합니다**
   *
   * @param {number} hours
   * @param {number} minutes
   */
  public addClassTime(hours: number, minutes: number) {
    if (this.classTimes.other.length < this.maxClass)
      this.classTimes.other.push([hours, minutes]);
    else
      throw new Error('ClassTime is already max length.');
    if (!this.checkOrder()) throw new Error('Invalid class time order. Class times should be in chronological order.');
  }
  private getElapsedTime(fromHour: number, fromMinute: number, toHour: number, toMinute: number): number {
    return ((toHour - fromHour) * 60) + toMinute - fromMinute;
  }
  private get(): Array<number[]> {
    const times: Array<number[]> = [];
    const durations: number[] = [];
    times.push([...this.classTimes.start]);
    for (const time of Object.values(this.classTimes.other)) {
      const prev: number[] = times[times.length - 1];
      durations.push(this.getDuration(prev, time));
      times.push([...time]);
    }
    durations.push(this.getDuration(times[times.length - 1], this.classTimes.end))
    durations.push(0);
    times.push([...this.classTimes.end]);
    for (let i = 0; i < times.length; i++) {
      times[i].push(durations[i]);
    }
    return times;
  }
  private getCurrent(hours: number, minutes: number): number {
    let returnIndex = -1;
    this.get().forEach(([startHour, startMinutes, duration], index) => {
      const pre = this.getElapsedTime(startHour, startMinutes, hours, minutes);
      if (pre >= 0 && pre < duration) returnIndex = index;
    });
    return returnIndex;
  }
  public getCurrentClass({ hours, minutes }: { hours: number, minutes: number }): number {
    if (!this.checkAllIn()) throw new Error(`ClassTime's length must be maxClass(${this.maxClass})`)
    const idx = this.getCurrent(hours, minutes);
    return (idx == 0) ? 1 : idx;
  }
}
export class ExamAttribute {
  public readonly selective: number;
  public readonly descriptive: number;
  public readonly ranges: string[] = [];

  /**
   * **시험 정보 객체를 생성합니다**
   * 
   * @constructor
   * @param {number} selective *선택형 문항 갯수*
   * @param {number} descriptive *서술형 문항 갯수*
   */
  constructor(selective: number, descriptive: number) {
    this.selective = selective;
    this.descriptive = descriptive;
  }
  /**
   * **범위 설명 행을 추가합니다**
   *
   * @param {string} range
   * @returns {ExamAttribute} *ExamAttribute Instance*
   */
  public addRange(range: string): ExamAttribute {
    this.ranges.push(range);
    return this;
  }
}
export class Subject {
  public subjectName: string;
  public teacher: string;
  public examAttribute: ExamAttribute | null = null;

  /**
   * **과목 객체를 생성합니다**
   * 
   * @constructor
   * @param {string} subjectName *과목 이름*
   * @param {string} teacher *선생님 이름*
   */
  constructor(subjectName: string, teacher: string) {
    this.subjectName = subjectName;
    this.teacher = teacher;
  }
  toString(): string {
    return this.subjectName;
  }
  /**
   * **과목의 시험범위를 설정합니다**
   *
   * @param {ExamAttribute} examAttribute *시험 정보*
   */
  setExam(examAttribute: ExamAttribute) {
    this.examAttribute = examAttribute;
  }
}
export enum SuffixType {
  NUMBER = 'NUMBER',
  ALPABET = 'ALPABET',
  ROMAN = 'ROMAN'
}
const SuffixTypes = {
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
export class DisplayOptions {
  private _suffixType: SuffixType;
  public fullName;

  /**
   * **표시 설정 객체를 생성합니다**
   *
   * @constructor
   * @param {SuffixType} [suffixType=SuffixType.NUMBER]
   * *접미사를 설정합니다*
   * - **SuffixType.NUMBER**: 기본 설정, 숫자
   * - **SuffixType.ALPABET**: 알파벳
   * - **SuffixType.ROMAN**: 로마 숫자
   * @param {boolean} [fullName=false] 
   * *전체 이름 표시 여부를 설정합니다*
   * - **true**: 전체 이름 표시
   * - **false**: 기본설정, 첫 단어만 표시
   */
  constructor(suffixType: SuffixType = SuffixType.NUMBER, fullName: boolean = false) {
    this._suffixType = suffixType;
    this.fullName = fullName;
  }
  public get suffixType(): (number | string)[] {
    return SuffixTypes[this._suffixType];
  }
}
export class SubjectList extends Subject {
  [order: number]: MultipleSubject;
  /**
   * **복수 과목 객체를 생성합니다**
   *
   * @constructor
   * @param {string} subjectName *과목 이름*
   * @param {string[]} teachers *선생님 이름 배열*
   * @param {(DisplayOptions | undefined)} options *표시 설정*
   */
  constructor(subjectName: string, teachers: string[], options: DisplayOptions = new DisplayOptions()) {
    super(subjectName, '');
    teachers.map(
      (teacher, index) => new MultipleSubject(subjectName, teacher, options.suffixType[index], options.fullName)
    ).forEach((sub, idx) => this[idx + 1] = sub);
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
  /**
   * **해당 요일의 정규 시간표로 등록합니다**
   *
   * @param {Day} day
   * *요일을 설정합니다*
   * - **Day.MONDAY**: 월요일
   * - **Day.THEUSDAY**: 화요일
   * - **Day.WEDNESDAY**: 수요일
   * - **Day.THURSDAY**: 목요일
   * - **Day.FRIDAY**: 금요일
   */
  public setToRegularSchedule(day: Day) {
    Setting.addSubjectsToSchedule(day, this.subjects);
  }
  /**
   * **해당 날짜의 시험 시간표로 등록합니다**
   *
   * @param {number} month
   * @param {number} date
   */
  public setToExamSchedule(month: number, date: number) {
    Setting.addExams(month, date, this.subjects);
  }
}
export class Setting {
  private static instance: Setting;

  private constructor() { }

  private static getInstance(): Setting {
    if (!Setting.instance) Setting.instance = new Setting();
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
  /**
   * **모의고사 날짜를 추가합니다**
   *
   * @static
   * @param {string} dateFormat *날짜 문자열('YYYY/MM/DD')*
   */
  static addMoakTest(dateFormat: string) {
    Setting.getInstance().mockTests.push(new Date(dateFormat));
  }
  /**
   * **수능 날짜를 설정합니다**
   *
   * @static
   * @param {string} dateFormat *날짜 문자열('YYYY/MM/DD')*
   */
  static setCSAT(dateFormat: string) {
    Setting.getInstance().CSAT = new Date(dateFormat);
  }
  /**
   * **과목을 그룹화합니다**
   *
   * @static
   * @param {Subject[]} subjects
   * @returns {SubjectGroup}
   */
  static group(...subjects: Subject[]): SubjectGroup {
    return new SubjectGroup(...subjects);
  }
  static addSubjectsToSchedule(day: Day, subjects: Subject[]) {
    Setting.getInstance().subjectsByTime[day] = subjects;
  }
  static addExams(month: number, date: number, subjects: Subject[]) {
    Setting.getInstance().examList.push(
      new Exams(month, date)
        .setSubjects(...subjects)
    );
  }
  /**
   * **교시 별 시간을 설정합니다**
   *
   * @static
   * @param {ClassTimeList} classTime *교시 별 시간 설정 객체*
   */
  static setClassTime(classTime: ClassTimeList) {
    Setting.getInstance().classTime = classTime;
  }
}
export const SelfStudy = Symbol('selfStudy');

import { load } from './timeTable.js';
export const loadPage = load;