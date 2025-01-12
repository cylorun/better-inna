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
        return "Something went wrong :/"
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

const onPageChange = async () => {
    if (window.location.href.endsWith('Grades')) {
        setTimeout(async () => {
            const banner = document.createElement('div');
            banner.style.position = 'fixed';
            banner.style.top = '0';
            banner.style.width = '100%';
            banner.style.backgroundColor = '#ffcc00';
            banner.style.color = '#000';
            banner.style.padding = '10px';
            banner.style.textAlign = 'center';
            banner.style.zIndex = '1000';
            banner.style.marginBottom = '20px';
            banner.id = "avg-grade"

            const avg = await getAverageGrade();
            banner.textContent = 'Average grade: ' + avg;

            document.body.prepend(banner);
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
