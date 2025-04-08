/**
 * Utility class để làm việc với ngày tháng
 */
class DateTimeHelper {
    /**
     * Lấy ngày hiện tại theo định dạng cụ thể
     * @param {string} format - Định dạng ngày (default: 'YYYY-MM-DD')
     * @returns {string} - Ngày hiện tại theo định dạng
     */
    static getCurrentDate(format = 'YYYY-MM-DD') {
        const now = new Date();
        
        // Thay thế các placeholder trong format string
        return format
            .replace('YYYY', now.getFullYear())
            .replace('MM', String(now.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(now.getDate()).padStart(2, '0'))
            .replace('HH', String(now.getHours()).padStart(2, '0'))
            .replace('mm', String(now.getMinutes()).padStart(2, '0'))
            .replace('ss', String(now.getSeconds()).padStart(2, '0'));
    }
    
    /**
     * Lấy ngày trong tương lai
     * @param {number} days - Số ngày trong tương lai
     * @param {string} format - Định dạng ngày (default: 'YYYY-MM-DD')
     * @returns {string} - Ngày trong tương lai theo định dạng
     */
    static getFutureDate(days, format = 'YYYY-MM-DD') {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        return format
            .replace('YYYY', futureDate.getFullYear())
            .replace('MM', String(futureDate.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(futureDate.getDate()).padStart(2, '0'))
            .replace('HH', String(futureDate.getHours()).padStart(2, '0'))
            .replace('mm', String(futureDate.getMinutes()).padStart(2, '0'))
            .replace('ss', String(futureDate.getSeconds()).padStart(2, '0'));
    }
    
    /**
     * Lấy ngày trong quá khứ
     * @param {number} days - Số ngày trong quá khứ
     * @param {string} format - Định dạng ngày (default: 'YYYY-MM-DD')
     * @returns {string} - Ngày trong quá khứ theo định dạng
     */
    static getPastDate(days, format = 'YYYY-MM-DD') {
        return this.getFutureDate(-days, format);
    }
    
    /**
     * Tính khoảng cách giữa hai ngày (số ngày)
     * @param {Date|string} date1 - Ngày thứ nhất
     * @param {Date|string} date2 - Ngày thứ hai
     * @returns {number} - Số ngày giữa hai ngày
     */
    static getDaysBetween(date1, date2) {
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);
        
        // Chuyển về UTC để tránh vấn đề múi giờ
        const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
        
        // Tính số mili giây trong một ngày
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        
        // Trả về số ngày (làm tròn)
        return Math.floor((utc2 - utc1) / MS_PER_DAY);
    }
    
    /**
     * Kiểm tra xem một ngày có phải là ngày trong tương lai không
     * @param {Date|string} date - Ngày cần kiểm tra
     * @returns {boolean} - True nếu là ngày trong tương lai
     */
    static isFutureDate(date) {
        const checkDate = date instanceof Date ? date : new Date(date);
        const today = new Date();
        
        // Đặt thời gian về 00:00:00 để so sánh chỉ ngày
        today.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);
        
        return checkDate > today;
    }
    
    /**
     * Kiểm tra xem một ngày có phải là ngày trong quá khứ không
     * @param {Date|string} date - Ngày cần kiểm tra
     * @returns {boolean} - True nếu là ngày trong quá khứ
     */
    static isPastDate(date) {
        const checkDate = date instanceof Date ? date : new Date(date);
        const today = new Date();
        
        // Đặt thời gian về 00:00:00 để so sánh chỉ ngày
        today.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);
        
        return checkDate < today;
    }
    
    /**
     * Định dạng lại một ngày theo format mong muốn
     * @param {Date|string} date - Ngày cần định dạng
     * @param {string} format - Định dạng mong muốn
     * @returns {string} - Ngày đã được định dạng
     */
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = date instanceof Date ? date : new Date(date);
        
        return format
            .replace('YYYY', d.getFullYear())
            .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(d.getDate()).padStart(2, '0'))
            .replace('HH', String(d.getHours()).padStart(2, '0'))
            .replace('mm', String(d.getMinutes()).padStart(2, '0'))
            .replace('ss', String(d.getSeconds()).padStart(2, '0'));
    }
    
    /**
     * Lấy timestamp hiện tại
     * @returns {number} - Timestamp hiện tại (milliseconds)
     */
    static getCurrentTimestamp() {
        return Date.now();
    }
    
    /**
     * Tạo một ID duy nhất dựa trên thời gian
     * @param {string} prefix - Tiền tố cho ID (optional)
     * @returns {string} - ID duy nhất
     */
    static generateTimeBasedId(prefix = '') {
        const timestamp = this.getCurrentTimestamp();
        const random = Math.floor(Math.random() * 10000);
        return `${prefix}${timestamp}${random}`;
    }
}

// Export class DateTimeHelper
export default DateTimeHelper;
