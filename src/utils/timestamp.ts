import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const timestampFormat = "YYYY-MM-DD HH:mm:ss.SSS";

export function getTimestap(): string {
    const formatted = dayjs().utc().format(timestampFormat);
    return formatted;
}
