export function getCourseThumbnail(course?: { id?: string; title?: string; thumbnail?: string } | null): string {
  if (course?.thumbnail && course.thumbnail.trim().length > 0) {
    return course.thumbnail;
  }

  const id = (course?.id || "").toLowerCase();
  const title = (course?.title || "").toLowerCase();

  if (id === "c-c-prog" || title.includes("c programming") || title === "c language") {
    return "/thumbnails/c-prog-course.jpg";
  }
  if (id === "c-python" || title.includes("python") || title.includes("100 days")) {
    return "/thumbnails/python-course.jpg";
  }
  if (id === "c-cpp-dsa" || (title.includes("c++") && title.includes("dsa"))) {
    return "/thumbnails/cpp-dsa-course.jpg";
  }
  if (id === "c-dbms" || title.includes("dbms") || (title.includes("database") && !title.includes("sql"))) {
    return "/thumbnails/dbms-course.jpg";
  }
  if (id === "c-cn" || title.includes("computer networks") || title.includes("network")) {
    return "/thumbnails/cn-course.jpg";
  }
  if (id === "c-daa" || title.includes("daa") || title.includes("analysis of algorithms")) {
    return "/thumbnails/daa-course.jpg";
  }
  if (id === "c-se" || title.includes("software engineering")) {
    return "/thumbnails/se-course.jpg";
  }
  if (id === "c-sql" || title.includes("sql") || title.includes("databases with sql")) {
    return "/thumbnails/sql-course.jpg";
  }
  if (id === "c-dsa" || title.includes("data structure") || title.includes("algorithm")) {
    return "/thumbnails/dsa-course.jpg";
  }

  return "/thumbnails/webdev-course.jpg";
}
