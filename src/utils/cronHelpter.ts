import { RepetitionType } from '../enums/recordatorisRepetition.enum';

export class CronExpression {
  static fromDateAndRepeat(date: Date, repeat: RepetitionType): string {
    console.log('1');
    const hours = date.getHours();
    const minutes = date.getMinutes();
    switch (repeat) {
      case RepetitionType.DAILY:
        return `${minutes} ${hours} * * *`;
      case RepetitionType.WEEKLY: {
        const day = date.getDay();
        return `${minutes} ${hours} * * ${day}`;
      }
      case RepetitionType.MONTHLY: {
        const monthDay = date.getDate();
        return `${minutes} ${hours} ${monthDay} * *`;
      }
      case RepetitionType.NEVER:
        return '';
      default:
        throw new Error('Tipus de repetició no suportat');
    }
  }
}
