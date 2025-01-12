const getModuleId = () => {
    const s = window.location.href.split('/');
    const id = s.at(-2);
    if (isNaN(id)) {
        return null;
    }

    return parseInt(id);
}

const getAverageGrade = async () => {
    const moduleId = getModuleId();
    if (moduleId === null) {
        return null;
    }

    const grades = await fetchGrades(moduleId);
    let final = 0

    grades.forEach(g => {
        if (g.grade && g.recalculatedWeight && g.name) {
            const weight = g.recalculatedWeight / 100
            const grade = parseFloat(g.grade.replace(',','.'))
            final+= grade * weight
        }
    });

    if (isNaN(final)) {
        return null;
    }

    return final;
}

const fetchGrades = async (moduleId) => {
    try {
        const response = await fetch(`https://nam.inna.is/api/StudentGrades/GetStudentGradeRuleGrades?groupId=${moduleId}`, {
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch grades:', error);
        return null;
    }
};

const getGradeColor = (gradeStr) => {
    const grade = parseFloat(gradeStr.replace(',', '.'));

    if (grade === 10) {
        return 'blue'
    }
    else if (grade >= 9) {
        return 'green';
    } else if (grade >= 7) {
        return 'lightgreen';
    } else if (grade >= 5) {
        return 'orange';
    } else if (grade > 0) {
        return 'red';
    } else {
        return 'darkred';
    }
};



const getGradesTable = () => {
    return document.querySelector('.width100.table.table-hover.student-grades-table');
}

const applyDarkMode = () => {
    const style = document.createElement('style');
    style.textContent = `
        html, body {
            background-color: black !important; /* Ensure the background color is applied */
            color: white !important;
        }

        table, tr, td, th, .inline-block {
            background-color: black !important; /* Target tables, rows, and cells specifically */
            color: white !important;
        }
        
    `;
    document.head.appendChild(style);
}

const onPageChange = async () => {
    setTimeout(() => {
        chrome.storage.sync.get('theme', (v) => {
            v = v.theme
            console.log('theme', v)
            if (v === "dark") {
                applyDarkMode();
            }
        })
    }, 500);


    if (window.location.href.endsWith('Grades')) {
        setTimeout(async () => {
            const avgGradesText = document.createElement('p');
            const gradesTable = getGradesTable();
            const avg = await getAverageGrade();

            avgGradesText.id = "avg-grade"
            avgGradesText.innerHTML = `<b>Average Grade: ${avg === null ? "Something went wrong :(" : avg.toFixed(1)} <b>`

            gradesTable.prepend(avgGradesText);

            const tbody = gradesTable.getElementsByTagName("tbody")[0];
            const rows = tbody.getElementsByTagName("tr");

            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                const gradeCell = cells[4];
                if (gradeCell) {
                    gradeCell.style.color = getGradeColor(gradeCell.textContent);
                    gradeCell.style.fontWeight = "bold";
                }
            }
        }, 1000);
    } else {
        const bannerEl = document.getElementById('avg-grade');
        if (bannerEl) {
            bannerEl.remove()
        }
    }
};

window.addEventListener('popstate', onPageChange);

onPageChange();
