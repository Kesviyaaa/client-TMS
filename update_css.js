const fs = require('fs');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    const replacements = [
        ['style={{ maxHeight: "60vh", overflowY: "auto" }}', 'className="scroll-60vh"'],
        ['style={{ zIndex: 99999 }}', 'className="z-99999"'],
        ['style={{ maxWidth: "400px" }}', 'className="max-w-400"'],
        ['style={{ fontSize: "5rem" }}', 'className="font-5rem"'],
        ['style={{ color: "#566a7f", fontSize: "1.125rem", fontWeight: 600 }}', ''],
        ['style={{ cursor: "pointer" }}', ''],
        ['style={{ color: "#50a9e9" }}', ''],
        ['style={{ fontSize: "1.2rem", color: "#a1acb8" }}', ''],
        ['style={{ height: 32, padding: "0 15px", fontSize: 12 }}', 'className="height-32 btn-sm-custom"'],
        ['style={{ height: 32 }}', 'className="height-32"'],
        ['style={{ height: "auto", minHeight: 110, paddingTop: 10 }}', 'className="pt-10-min-110"'],
        ['style={{ width: "60%" }}', 'className="width-60"'],
        ['style={{ width: "40%" }}', 'className="width-40"'],
        ['style={{ maxWidth: \'80px\' }}', 'className="qt-input-med"'],
        ['style={{ color: "#1976d2" }}', 'className="charge-icon"'],
        ['style={{ width: 680, maxHeight: "85vh", overflowY: "auto" }}', 'className="scroll-60vh" style={{ width: 680 }}'],
        ['style={{ background: "#50a9e9", color: "#fff", margin: "-1.5rem -1.75rem 0", padding: "14px 20px", borderRadius: "0.5rem 0.5rem 0 0" }}', 'className="modal-title-custom"'],
        ['style={{ paddingTop: 20 }}', 'className="modal-body-custom"'],
        ['style={{ height: 60, paddingTop: 8 }}', 'className="height-60-pt-8"'],
        ['style={{ background: "#f5f5f5" }}', 'className="disabled-bg"'],
        ['style={{ marginTop: 16 }}', 'className="modal-buttons-custom"'],
        ['style={{ marginTop: 24 }}', 'className="modal-buttons-custom"'],
        ['style={{ width: 420 }}', 'className="max-w-400"'],
        ['style={{ fontWeight: 600, marginBottom: 10 }}', 'className="lob-label"'],
        ['style={{ paddingLeft: 12, cursor: "pointer" }}', 'className="lob-select"'],
        ['style={{ height: "auto" }}', 'className="h-auto"'],
        ['style={{ width: "80px" }}', 'className="qt-input-small"'],
        ['style={{ height: 38 }}', 'className="height-38"'],
        ['style={{ boxShadow: "none", border: "1px solid #eef0f2" }}', 'className="sub-card"'],
        ['style={{ padding: "8px 15px", background: "#f8f9fa" }}', 'className="sub-card-header"'],
        ['style={{ fontSize: "14px", color: "#3b5998" }}', 'className="sub-card-title"'],
        ['style={{ padding: "15px" }}', 'className="sub-card-body"'],
        ['style={{ marginBottom: 0 }}', 'className="mb-0"'],
        ['style={{ textAlign: "center", color: "#a1acb8" }}', 'className="text-center text-muted"'],
        ['style={{ width: "100%" }}', 'className="w-100"'],
        ['style={{ fontSize: "18px" }}', 'className="font-18"']
    ];

    replacements.forEach(([target, replacement]) => {
        // Need to handle missing quotes, single quotes, extra spaces
        const escTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        content = content.replace(new RegExp(escTarget, 'g'), replacement);
    });
    
    // clean up empty classNames resulting from appends
    content = content.replace(/ \className=""/g, '');
    content = content.replace(/ className=""/g, '');

    fs.writeFileSync(file, content);
}

processFile('src/components/pages/forwarding/Bookings.jsx');
processFile('src/components/pages/forwarding/Quotations.jsx');
console.log("Done updating react files.");
