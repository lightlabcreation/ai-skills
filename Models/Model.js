import db from "../Config/Connection.js"

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getAll() {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName}`);
    return rows;
  }
  async getByField(field, value) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`, [value]);
    return rows;
  }

  async findCorrectAns(id) {
    const [rows] = await db.query(`SELECT correct_option FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows;
  }

  async getAllByRole(role) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE role = ?`, [role]);
    return rows;
  }

  async getById(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows.length > 0 ? rows[0] : null;
  }
  async findStudentById(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE student_id = ?`, [id]);
    return rows.length > 0 ? rows : null;
  }
  async getAvgRatingByCourseIds(courseIds = []) {
    if (courseIds.length === 0) return [];

    const placeholders = courseIds.map(() => '?').join(', ');
    const [rows] = await db.query(
      `
    SELECT course_id, AVG(rating) AS average_rating, COUNT(*) AS total_reviews
    FROM reviews
    WHERE course_id IN (${placeholders})
    GROUP BY course_id
    `,
      courseIds
    );
    return rows;
  }


  async getBySubTitleId(subTitleId) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE subTitle_id = ?`, [subTitleId]);
    return rows.length > 0 ? rows : [];
  }

  async getLastMessageByUserId(userId) {
    console.log("userId", userId);
    const [rows] = await db.query(
      `SELECT * FROM messages 
         WHERE sender_id = ? OR receiver_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
      [userId, userId]
    );
    return rows[0] || null;
  }



  async getByInstructorId(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE instructor_id = ?`, [id]);
    return rows.length > 0 ? rows : null;
  }
  async getByCourseId(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE course_id = ?`, [id]);
    return rows.length > 0 ? rows : [];
  }

  async getByCourseIdTest(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows.length > 0 ? rows : [];
  }

  async deleteByCourseId(id) {
    const [result] = await db.query(`DELETE FROM ${this.tableName} WHERE course_id = ?`, [id]);
    return result;
  }

  async findEmail(email) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getStudentNameById(student_id) {
    const [rows] = await db.query(`SELECT * FROM student WHERE id = ?`, [student_id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async create(data) {
    const [result] = await db.query(`INSERT INTO ${this.tableName} SET ?`, [data]);
    return result;
  }

  async createMultiple(data) {
    const placeholders = data.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const flatValues = data.flat();

    const [result] = await db.query(
      `INSERT INTO ${this.tableName} (course_id, question_id, answer, student_id, is_correct) VALUES ${placeholders}`,
      flatValues
    );

    return result;
  }

  async update(id, data) {
    const [result] = await db.query(`UPDATE ${this.tableName} SET ? WHERE id = ?`, [data, id]);
    return result;
  }

  async updateStatus(id, status) {
    const [result] = await db.query(`UPDATE ${this.tableName} SET is_active = ? WHERE id = ?`, [status, id]);
    return result;
  }

  async updateByEmail(email, data) {
    const [result] = await db.query(`UPDATE ${this.tableName} SET ? WHERE email = ?`, [data, email]);
    return result;
  }

  async delete(id) {
    const [result] = await db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return result;
  }

  // Find existing test by student and course
  async findByStudentAndCourse(student_id, course_id) {
    const [rows] = await db.query(
      `SELECT * FROM submit_test WHERE student_id = ? AND course_id = ?`,
      [student_id, course_id]
    );
    return rows;
  }
  // Delete previous test
  async deleteByStudentAndCourse(student_id, course_id) {
    await db.query(
      `DELETE FROM submit_test WHERE student_id = ? AND course_id = ?`,
      [student_id, course_id]
    );
  }

  async bulkInsert(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return;

    const values = dataArray.map(
      item => `(${db.escape(item.course_id)}, ${db.escape(item.student_id)}, ${db.escape(item.question_id)}, ${db.escape(item.answer)}, ${db.escape(item.is_correct)}, ${db.escape(item.created_at)})`
    ).join(',');

    const query = `
            INSERT INTO submit_test (course_id, student_id, question_id, answer, is_correct, created_at)
            VALUES ${values}
        `;

    await db.query(query);
  }

  async getAllStudentsWithCourses() {
    const [result] = await db.query(`
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        s.is_active,
        s.email,
        s.mobile,
        c.id AS course_id,
        c.course_title,
        c.course_description,
        c.course_image,
        c.course_type,
        c.course_price,
        c.course_content_video_link,
        c.test_video,
        c.faqs,
        c.status,
        c.category_id,
        c.instructor_id
      FROM 
        student s
      JOIN 
        courses c 
      ON 
        FIND_IN_SET(c.id, REPLACE(REPLACE(REPLACE(s.course_id, '[', ''), ']', ''), ' ', ''))
      `,
    );
    return result;
  }

  async getStudentWithCourseById(id) {
    const [result] = await db.query(
      `
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        s.is_active,
        s.email,
        s.mobile,
        c.id AS course_id,
        c.course_title,
        c.course_description,
        c.course_image,
        c.course_type,
        c.course_price,
        c.course_content_video_link,
        c.test_video,
        c.faqs,
        c.status,
        c.category_id,
        c.instructor_id
      FROM 
        student s
      JOIN 
        courses c 
      ON 
        FIND_IN_SET(c.id, REPLACE(REPLACE(REPLACE(s.course_id, '[', ''), ']', ''), ' ', ''))
      WHERE 
        s.id = ?
      `,
      [id]
    );
    return result;
  }

  async getSubcriptionByAdminId(admin_id) {
    const [[sub]] = await db.query(
      `SELECT s.*, p.name AS plan_name, p.features FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.admin_id = ? AND s.status = 'active' AND s.end_date > NOW()`,
      [admin_id]
    );
    return sub;
  }

  async findCategoryById(id) {
    const [rows] = await db.query(
      'SELECT category_name FROM category WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0]?.category_name || null;
  }

  async findBlogById(id) {
    const [rows] = await db.query(
      'SELECT title FROM article WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0]?.title || null;
  }

  async findCategory(ategory_name) {
    const [rows] = await db.query(
      'SELECT category_name FROM category WHERE category_name = ? LIMIT 1',
      [ategory_name]
    );
    return rows[0]?.category_name || null;
  }

  async findInstructorById(id) {
    const [rows] = await db.query(
      'SELECT * FROM instructor WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  async findProduct(product_title) {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE product_title = ?',
      [product_title]
    );
    console.log(rows);
    return rows[0];
  }

  async findCertificate(template_name) {
    const [rows] = await db.query(
      'SELECT * FROM certificate_template WHERE template_name = ?',
      [template_name]
    );
    console.log(rows);
    return rows[0];
  }

  async findarticle(title) {
    const [rows] = await db.query(
      'SELECT * FROM article  WHERE title  = ?',
      [title]
    );
    console.log(rows);
    return rows[0];
  }

  async count() {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${this.tableName}`);
    return rows[0].total;
  }

  async activeInstructor() {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM instructor WHERE is_active = 1`);
    return rows[0].total;
  }

  async isVerifiedInstructorCount(verified) {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM instructor WHERE is_verified = ?`, [verified]);
    return rows[0].total;
  }

  async inactiveInstructor() {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM instructor WHERE is_active = 0`);
    return rows[0].total;
  }

  async last3Student() {
    const [rows] = await db.query(`SELECT id, name, course_id FROM student ORDER BY created_at DESC LIMIT 3`);
    return rows;
  }

  async getStudentCourses(courseIds) {
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return [];
    }

    const [rows] = await db.query(
      `SELECT course_title FROM courses WHERE id IN (${courseIds.map(() => '?').join(',')})`,
      courseIds
    );
    return rows;
  }


  async getMessagesBetweenUsers({ sender_id, receiver_id }) {
    const sql = `
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `;

    // Pass parameters for both parts of the OR condition
    const [rows] = await db.query(sql, [sender_id, receiver_id, receiver_id, sender_id]);
    // Destructure the result to get only the rows (messages)
    return rows;
  }

  async getCart(userId) {
    const [items] = await db.query(
      `SELECT 
       ci.id AS cart_item_id,
       c.id AS course_id,
       u.id AS user_id,
       c.course_title,
       c.course_image,
       c.course_type,
       c.course_price
     FROM cart_items ci
     JOIN courses c ON ci.course_id = c.id
     JOIN student u ON ci.user_id = u.id
     WHERE ci.user_id = ?`,
      [userId]
    );

    const total = items.reduce((sum, item) => sum + parseFloat(item.course_price), 0);

    return { items, total };
  };


  async getEnrollByStudntiId(studentId) {
    const [rows] = await db.query(
      `SELECT c.* FROM courses c
     JOIN enrollments e ON e.course_id = c.id
     WHERE e.student_id = ?`,
      [studentId]
    );
    return rows.length > 0 ? rows : null;
  }

  async getByCourseSyllabusId(course_syllabus_id) {
    const [row] = await db.query(`SELECT * FROM ${this.tableName} WHERE course_id = ?`, [course_syllabus_id]);
    return row.length > 0 ? row : null;
  }

  async getByCourseSyllabusIdTest(course_syllabus_id) {
    const [row] = await db.query(`SELECT * FROM ${this.tableName} WHERE course_syllabus_id = ?`, [course_syllabus_id]);
    return row.length > 0 ? row : null;
  }
  async getByIds(ids) {
    if (!ids || !ids.length) return [];

    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT * FROM test_questions WHERE id IN (${placeholders})`;

    const [rows] = await db.query(query, ids);
    return rows;
  }


  async getByIdWithFieldsName(data, field_name, course_syllabus_id) {
    const [row] = await db.query(`SELECT ${data} FROM ${this.tableName} WHERE ${field_name} = ?`, [course_syllabus_id]);
    return row.length > 0 ? row : null;
  }

  async getONLYId(fields_name, id) {
    const [row] = await db.query(`SELECT id FROM ${this.tableName} WHERE ${fields_name} = ?`, [id]);
    return row.length > 0 ? row : null;
  }


  async deleteByFields(table_field, id) {
    const [result] = await db.query(`DELETE FROM ${this.tableName} WHERE ${table_field} = ?`, [id]);
    return result;
  }

  async getQuestionById(id) {
    const [row] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return row.length > 0 ? row : null;
  }

  async countByInstructor(instructorId) {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${this.tableName} WHERE instructor_id = ?`, [instructorId]);
    return rows[0].total;
  }
  async countByStudent(instructorId) {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${this.tableName} WHERE instructor_id = ?`, [instructorId]);
    return rows[0].total;
  }
  async averageRating(instructorId) {
    const [rows] = await db.query(`
    SELECT 
      s.id AS student_id,
      s.name AS student_name,
      AVG(r.rating) AS average_rating
    FROM student s
    JOIN reviews r ON s.id = r.student_id
    WHERE s.instructor_id = ?
    GROUP BY s.id
    ORDER BY average_rating DESC
    LIMIT 3
  `, [instructorId]);
    return rows;
  }

}

export default BaseModel