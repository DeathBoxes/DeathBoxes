/**
* DeathBox: A Simple Afterlife Archive
 * 
 * @file deathboxes.js
 * @version 1.81
 * @author Russell McVeigh (hello@deathboxes.co.uk) Copyright ©2025
 * @date 3rd December 2025
 * @description DeathBoxes is an online application to help you create a single, comprehensive document that holds all the key information people may need when you die.
 *
 * Apologies for the combination of vanilla JavaScript and jQuery.
 * I intend to recode everything for jQuery; ironically, life tends to get in the way ;)
 *
 */

/*
MIT License

Copyright (c) 2025 Russell McVeigh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* MAIN CONFIGURABLE SETTINGS */

// Set to true to enable console logging
var debug = false;

// Use a fixed logo (stays in place when scrolling)
var useFixedLogo = false;

// Use a fixed background logo on the jumbotron (if false, it uses a regular <img> tag, prevents logo blurring if true)
var useBackgroundLogo = false;

// Make the whole jumbotron fixed, including h1 text (supports logo blurring)
var useFixedJumbotron = false;

// Blur the logo on scroll
var blurLogo = false;

// Jump to top of form after progress file is loaded?
var scrollToFormOnProgressLoad = false;

var showEmptyProgressLegend = false;

// This is for Google SEO - it should be false when used locally! (it doesn't track, store or log any data)
var addStructuredData = false;

// Below is the default form template data. You can modify this to add or remove sections, fields or values but take note of the data structure!
// If an uploaded progress file is missing sections (that are present int the default), the user is offered the chance to include them

/**
 * IMPORTANT!
 * Any new sections or repeatable subsections MUST use unique titles and names (it's fine to duplicate field names and descriptions)
 * Nodes with an explicit 'id' set (e.g. db-designated-name) MUST NOT BE CHANGED - these are used to construct filenames based on the user's data
 */

let formData = [
{
  title:"DeathBox Settings",
  description: "This sections allows you to specify the person you would like to open your DeathBox when you die. You can also write a custom message for them that will appear in the final PDF.",
  fields:[
	 {name:"Designated Person", description:"You should only appoint someone that you trust implicitly as you may be providing highly sensitive and deeply private information. This person will have complete access to your finances, property and personal affairs, so you are essentially entrusting your legacy to them. Choose wisely.", fields:[
	 {name:"Title",id:"db-designated-title",description:"How this person prefers to be addressed (e.g. Mr, Mrs, Ms, Dr, Rev)"},
	 {name:"Full Name (including any middle names)",id:"db-designated-name",description:"Your DeathBox PDF will mention this person by name – double-check that their details are correct!"},
	 {name:"Gender Identity",description:"How this person wishes to be referred to (e.g. male, female, non-binary, prefer to self-describe)"},
	 {name:"Relationship to You", description:"e.g. Mother"},
	 {name:"Address"},
	 {name:"Postcode/Zip"},
	 {name:"Phone"},
	 {name:"Email"}
	 ]},
	 {name:"Foreword", description:"This section allows you to provide a custom message at the start of your DeathBox, intended for the person that will be opening it. Remember, it may only be a matter of days since your death when they read this. Be as concise, open and sincere as you possibly can – the foreword can be viewed as your last ever chance to speak to them directly.",
	 fields:[
	 	{name:"Details",id:"db-foreword-text", value:"Firstly, I hope this finds you well and you are managing okay without me. The document you are reading is my DeathBox. It's a simple but comprehensive archive containing all the information I wanted you to have after my death. It may contain both practical details, such as my last will and testament or burial arrangements, and more personal information, such as my favourite people, places and things.\n\nI might have included instructions to look after my home, children or pets, or details of relationships I wanted to repair or conflicts I had hoped to resolve but didn't quite manage to when I was alive. I appreciate you may be struggling to come to terms with my absence, but just to let you know, I had you in mind when I created this document and you always meant a great deal to me.\n\nPlease handle this document with great care as it may contain highly sensitive and deeply private information that will allow anyone who reads it complete access to my finances, property and personal affairs.\n\nThank you."},
		{name:"Sign-Off Name",id:"db-foreword-signoff", description:"This will be added to the above text."}
	]}
  ]
},
{
  title:"You and Your Dearest",
  description: "Your name, address, next of kin, spouse or partner, dependants, relatives and other people you wish to notify about your death. Remember, families come in all different shapes and sizes, so you can still include people here that aren't technically related to you (e.g. legal guardians or godparents).",
  fields:[
  	{name:"You", fields:[
    {name:"Official/Preferred Title",id:"db-you-title"},
    {name:"Full Name (including any middle names)",id:"db-you-name"},
    {name:"Gender Identity"},
    {name:"Date of Birth"},
	{name:"Marital Status"},
    {name:"Address"},
    {name:"Postcode/Zip"},
	{name:"Phone"},
	{name:"Email"},
	{name:"Notes"}
	]},
	{name:"Next of Kin", repeat:true, fields:[
      {name:"Full Name"}, {name:"Gender Identity"},{name:"Relationship to You (e.g. Father)"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]},
	{name:"Spouse, Partner or Significant Other", repeat:true, fields:[
      {name:"Full Name"}, {name:"Gender Identity"},{name:"Relationship to You"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]},
    {name:"Child / Dependant", repeat:true, fields:[
      {name:"Full Name"}, {name:"Gender Identity"},{name:"Age"}, {name:"Relationship to You (e.g. Daughter)"},{name:"Address"}, {name:"Postcode/Zip"},
      {name:"Phone"}, {name:"Email"},{name:"Notes"},
	  {name:"Guardian Full Name"}, {name:"Guardian Gender Identity"}, {name:"Guardian Address"}, {name:"Guardian Postcode/Zip"}, {name:"Guardian Phone"}, {name:"Guardian Email"},
	  {name:"Guardian Notes"}
    ]},
	{name:"Other Relative", repeat:true, fields:[
      {name:"Full Name"}, {name:"Gender Identity"},{name:"Relationship to You"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]},
	{name:"Other Person to Notify About My Death", repeat:true, fields:[
      {name:"Full Name"}, {name:"Gender Identity"},{name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Last Will and Testament",
  description:"Creating a will online in the UK is legally valid only if it follows the same formal rules as a traditional paper will: it must be printed, signed by you, and witnessed by two adults who are not beneficiaries or their spouses.  Electronic signatures or fully digital wills are not yet recognised by law.  Mistakes in wording, signing, or witnessing can make a will invalid.  Always keep the original signed copy safe and tell your executor where it is stored.  Seek legal advice for complex estates or family situations.",
  fields:[
  	{name:"Executor", fields:[
  	{name:"Full Name"},
	{name:"Gender Identity"},
	{name:"Relationship to You"},
	{name:"Address"},
	{name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"},
	{name:"Full Name of Substitute Executor"}, {name:"Notes"}
	]},
	{name:"Beneficiary", description: "Who gets what", repeat:true, fields:[
      {name:"Full Name"}, {name:"Gender Identity"}, {name:"Relationship to You"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Gift or Share of Estate Details"}, {name:"Notes"}
    ]},
	{name:"Residuary Clause", description: "Outline what happens to anything that's not listed.", fields:[
	{name:"Full Name of Person(s) to Receive any Remaining Assets (Include Details for Gifts and Share of Estate)"},
	{name:"Details of any Substitute Beneficiaries (if primary cannot inherit)"},
    {name:"Notes"}
    ]},
    {name:"Witness", description: "Witnesses must be over 18, have mental capacity, and cannot be beneficiaries of the will, nor the spouse or civil partner of a beneficiary. If they are, the will itself remains valid but any gift to that beneficiary becomes void.", repeat:true, fields:[
      {name:"Full Name", description: "Cannot be a beneficiary or their spouse/partner"}, {name:"Gender Identity"}, {name:"Occupation"}, {name:"Signature", description:"Leave this field blank – you'll need to print out and sign a physical paper copy!"}, {name:"Date"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]},
	{name:"Declaration and Consent", description: "Signature, date and statement confirming voluntary action and sound mind.", fields:[
      {name:"Declaration", description: "You can leave this as-is if you're happy with the wording", value:"I declare that I am of sound mind, acting of my own free will, and fully understand the contents of this will. I make this document voluntarily and without undue influence from any person."}, {name:"Testator Signature", description:"Leave this field blank – you'll need to print out and sign a physical paper copy!"}, {name:"Date"}
    ]}
  ]
},
{
  title:"Burial / Cremation / Funeral Service",
  description: "Don't let your life be punctuated by a vapid send-off.  This is perhaps the most important section of this form, and the main raison d'être behind DeathBox.  Be sure to include as many details as possible.",
  fields:[
  	 {name:"Specific Instructions for Funeral Service", description:"Share any funeral or burial preferences you'd like others to know about. This might include your desired ceremony type, burial location, religious or cultural observances or any special requests. Having this information documented helps ensure your wishes are respected and makes things easier for your loved ones. For favourites, use the 'Friends and Favourites' section.", fields:[
  	 	{name:"Details"},
	 ]},
	 {name:"Funeral Director", fields:[
  	 {name:"Contact Name"},
	 {name:"Gender Identity"},
	 {name:"Address"},
	 {name:"Postcode/Zip"},
	 {name:"Phone"},
	 {name:"Email"}
	 ]},
	 {name:"Celebrant / Officiant", fields:[
	 {name:"Contact Name"},
	 {name:"Gender Identity"},
	 {name:"Address"},
	 {name:"Postcode/Zip"},
	 {name:"Phone"},
	 {name:"Email"}
	 ]},
	 {name:"Eulogy",
	 description: "An honest, well-written and balanced eulogy can transform a mediocre funeral service into an experience that leaves you feeling privileged, heartbroken and bewitched all at the same time.  Although it's a little odd to write your own eulogy, it can be a worthwhile exercise if approached as a tool for self-examination rather than a way to control your legacy. The actual eulogy – the one that matters – will be written by people who knew you and are trying to make sense of your absence.", repeat:true, fields:[
	 {name:"Eulogy Text"},
	 {name:"Eulogy URL (e.g. Google Drive)"},
	 {name:"Author Name"},
	 {name:"Author Gender Identity"},
	 {name:"Author Address"},
	 {name:"Author Postcode/Zip"},
	 {name:"Author Phone"},
	 {name:"Author Email"}
	 ]}
    ]
},
{
  title:"Obituaries",
  description: "Placing a well-crafted obituary in the local press is a good way to reach a wider public audience. If it's already been written, you can include the details below (it's not unusual to have different versions for multiple publications). Less personal than a eulogy, an obituary should be a factual announcement or biographical summary that can include practical details (e.g. who's paying for the bar at your wake). It's common to draft or write your own.",
  fields:[
	 {name:"Obituary", repeat:true, fields:[
	 {name:"Obituary Text"},
	 {name:"Obituary URL (e.g. Google Drive)"},
	 {name:"Target Publications", description:"The newspapers or classified sections you would like this obituary to appear in"},
	 {name:"Author Name"},
	 {name:"Author Gender Identity"},
	 {name:"Author Address"},
	 {name:"Author Postcode/Zip"},
	 {name:"Author Phone"},
	 {name:"Author Email"}
	 ]}
    ]
},
{
  title:"Politics, Religion and Faith",
  description: "Nothing reveals more about your deeper self than your attitudes towards politics, religion and faith. They offer insight into how you have engaged with and shaped the world around you.",
  fields:[
    {name:"Political Views", description: "Whether you're a dyed-in-the-wool socialist or a staunch conservative, sharing information about your political leanings can help others understand you more fully.", fields:[
		{name:"Details"}
	]},
    {name:"Religion", description: "A local reverend or religious leader is often one of the first points of contact when somebody dies.  Be sure to include any significant details about the nature of your spirituality and any religious customs you observed.", fields:[
		{name:"Denomination/Faith", description:"e.g., Christian, Muslim, Jewish, Hindu, Buddhist, etc."}
	]},
    {name:"Local Church, Mosque or Place of Worship", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]},
    {name:"Pastor, Reverend, Imam, Rabbi etc.", repeat:true, fields:[
      {name:"Title"}, {name:"Name"}, {name:"Gender Identity"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Friends and Favourites",
  description: "It's all the little things that make you a real person. This section is especially useful for those appointed to arrange your funeral or burial service.",
  fields:[
    {name:"Friend", repeat:true, fields:[
      {name:"Name"}, {name:"Gender Identity"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes", description:"You can use this section to describe your friend and what made their friendship so special. For extra context, consider adding an anecdote or memories that are especially meaningful."}
    ]},
	{name:"Favourite Band/Singer", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]},
    {name:"Favourite Song", repeat:true, fields:[
      {name:"Title"}, {name:"Artist"}, {name:"Notes"}
    ]},
	{name:"Favourite Film/TV Show", repeat:true, fields:[
      {name:"Title"}, {name:"Notes"}
    ]},
    {name:"Favourite Actor", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]},
    {name:"Favourite Artist", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]},
    {name:"Favourite Author", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]},
    {name:"Favourite Book", repeat:true, fields:[
      {name:"Title"}, {name:"Author"}
    ]},
    {name:"Favourite Poem or Prose", repeat:true, fields:[
      {name:"Title"}, {name:"Author"}, {name:"Notes"}
    ]},
    {name:"Favourite Creature", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]},
	{name:"Favourite Plant", description:"Do you prefer the carrot over the geranium?", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]},
    {name:"Favourite Colour", repeat:true, fields:[
      {name:"Colour"}, {name:"Notes"}
    ]},
    {name:"Favourite Food", repeat:true, fields:[
      {name:"Food"}, {name:"Notes"}
    ]},
	{name:"Favourite Smell or Fragrance", description:"Smells literally tap into the place in our brain where memories are triggered. Including your favourite scent might allow someone to emulate your smell for comfort when you're gone.", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]},
    {name:"Other Favourite Thing", repeat:true, fields:[
      {name:"Name"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Medical and Healthcare",
  description: "Providing your health details can help when deciding how to handle any organ donations or medical research you may have consented to. It also allows your loved ones to contact your doctor, clinic, hospital or medical professionals in order to cancel any pending or ongoing medication, surgery or treatment plans.",
  fields:[
  {name:"Basic", fields:[
    {name:"Blood Type"}, {name:"National Insurance/Social Security Number"},
	{name:"Donor ID Number"}
	]},
	{name:"Health Condition", repeat:true, fields:[
      {name:"Name"}, {name:"Description"}
    ]},
    {name:"Medication", repeat:true, fields:[
      {name:"Name"}, {name:"Type (e.g. painkiller)"}, {name:"Dosage"}, {name:"Notes"}
    ]},
    {name:"Doctor, Clinic or Practice", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]},
    {name:"Healthcare Provider", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Description"}, {name:"Cost"}, {name:"Expiry Date"},
	  {name:"Notes"},
      {name:"Online Account URL"},
      {name:"Username"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"}
    ]},
    {name:"Other Heathcare", repeat:true, fields:[
      {name:"Description"}
    ]}
  ]
},
{
  title:"Pets",
  description: "Information like who walks your dog or feeds your cat when you're away can help to minimise any disruption or distress to your pets' regular schedule. Be sure to include the contact details of your vet so that any treatment or insurance plans can be managed or cancelled.",
  fields:[
    {name:"Pet", repeat:true, fields:[
      {name:"Name"}, {name:"Sex"}, {name:"Species / Breed"}, {name:"Age"}, {name:"Health Conditions"},
      {name:"Veterinary Details"}, {name:"Special Instructions (favourite toy, treat etc.)"}
    ]}
  ]
},
{
  title:"Home and Garden",
  description: "Depending upon your circumstances, your home and garden might be left vacant after you die. Be sure to provide enough information so that those you leave behind can make the necessary arrangements to keep it maintained. This might include contacting keyholders, gardeners or cleaners, or knowing the combination to the back gate or garage door.",
  fields:[
    {name:"Key Holder", description:"Provide details of all the people that have a key to your home.", repeat:true, fields:[
      {name:"Name"}, {name:"Gender Identity"}, {name:"Property Location"}, {name:"Key Holder Address"}, {name:"Key Holder Postcode/Zip"}, {name:"Key Holder Phone"}, {name:"Key Holder Email"}, {name:"Notes"}
    ]},
    {name:"Safe, Lock, Gate or Padlock", repeat:true, fields:[
      {name:"Description", description:"e.g. key for back gate"}, {name:"Location", description:"e.g. in the top kitchen drawer"}, {name:"Combination/Passcode"}, {name:"Notes"}
    ]},
    {name:"Gardener Contact Details", repeat:true, fields:[
      {name:"Name"}, {name:"Gender Identity"}, {name:"Garden Location"}, {name:"Gardener Address"}, {name:"Gardener Postcode/Zip"}, {name:"Gardener Phone"}, {name:"Gardener Email"}, {name:"Notes"}
    ]},
    {name:"Cleaner Contact Details", repeat:true, fields:[
      {name:"Name"}, {name:"Gender Identity"}, {name:"Cleaning Location"}, {name:"Cleaner Address"}, {name:"Cleaner Postcode/Zip"}, {name:"Cleaner Phone"}, {name:"Cleaner Email"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Personal Possessions",
  description: "This section allows you to list your personal possessions. You can make a comprehensive list of everything you own, or just include the important objects. There's also a field to specify what should happen to something after you die (can be used in conjuction with your Last Will and Testament).",
  fields:[
    {name:"Object", repeat:true, fields:[
      {name:"Name", description:"e.g. Vintage guitar or Oak dining table"},
	  {name:"Description", description:"Try to provide as much detail as possible to avoid any potential confusion"},
	  {name:"Estimated Worth", description:"Be realistic - sentimental value may not always translate to greater worth"},
	  {name:"Action", description:"This could be giving it to a specific person, selling it or donating it to a worthy cause"}
    ]},
  ]
},
{
  title:"Hobbies and Interests",
  description: "Whether it's gaming or glassblowing, hiking or home brewing, it's good for those you leave behind to know what you enjoyed doing with your spare time.",
  fields:[
    {name:"Hobby / Activity", repeat:true, fields:[
      {name:"Title"}, {name:"Description"}
    ]},
  ]
},
{
  title:"Clubs, Groups and Memberships",
  description: "Whether it's the library, gym, amateur dramatics society or simply the local pub, many of us feel right at home in a group of like-minded folk. Provide enough information so that your groups can be notified of your death. This also reduces the chance of those you leave behind having to pay for unused member subscriptions.",
  fields:[
    {name:"Gym Membership", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Online Account URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"},{name:"Notes"}
    ]},
	{name:"Club Membership", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Online Account URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"},{name:"Notes"}
    ]},
    {name:"Library Membership", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Online Account URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Regular Restaurant", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]},
    {name:"Regular Bar / Pub", repeat:true, fields:[
      {name:"Name"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Work and Employment",
  description: "Colleagues would no doubt notice your absence, but it's always good to stay ahead of the game! Provide details so that those you leave behind can contact employers to officially terminate your employment, sort out your tax and collect any wages due.",
  fields:[
    {name:"Employer", repeat:true, fields:[
      {name:"Name"}, {name:"Job Title"}, {name:"Description"}, {name:"Address"}, {name:"Postcode/Zip"}, {name:"Phone"}, {name:"Email"}, {name:"Website"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Education and Training",
  description: "What to do when a clever clogs pops their clogs. Make sure you provide enough details so that lessons, workshops or private tuition schedules can be cancelled. Remember, you won't be around, and this is not a CV!",
  fields:[
    {name:"School, Establishment or Institution", repeat:true, fields:[
      {name:"Organisation"},
	  {name:"Address"},
	  {name:"Postcode"},
	  {name:"Phone"},
	  {name:"Email"},
	  {name:"Course / Subject Title"},
	  {name:"Tutor Name"},
	  {name:"Tutor Gender Identity"},
	  {name:"Tutor Phone"},
	  {name:"Tutor Email"},
	  {name:"Certificate or Qualification Gained"},
	  {name:"Description"},
	  {name:"Online Account URL"},
      {name:"Username"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Properties",
  description: "Be sure to provide details of any overseas properties, additional residences or homes that you rent to others. You can provide details of tenants, landlords or letting agents in the notes section. Use the 'Home and Garden' section to include more practical information.",
  fields:[
    {name:"Property", repeat:true, fields:[
      {name:"Address"}, {name:"Postcode/Zip"}, {name:"Country"}, {name:"Phone"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Vehicles",
  description: "When you pass away, your vehicles can continue to accumulate considerable costs by way of tax, insurance, parking fees and any ongoing service and maintenance fees. Make sure you provide enough information for those you leave behind to cancel such arrangements.",
  fields:[
    {name:"Vehicle", repeat:true, fields:[
      {name:"Vehicle Description"}, {name:"Vehicle Registration Number"}, {name:"Vehicle Type"}, {name:"Insurance Provider"},{name:"Insurance Reference Number"},{name:"Insurance Expiry Date"}, {name:"Tax Due Date"}, {name:"Next MOT Due Date"}, {name:"Next Service Due Date"},
      {name:"Service Centre Name"}, {name:"Service Centre Address"}, {name:"Service Centre Phone"}, {name:"Service Centre Email"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Utilities",
  description: "Providing these details will allow those you leave behind to cancel your energy provision and reduces the chance of them receiving unnecessary bills or incurring late payment penalty charges.",
  fields:[
    {name:"Electricity", fields:[
	  {name:"Supply Address"},
	  {name:"Supply Postcode/Zip"},
      {name:"Provider"}, {name:"Tariff Name"}, {name:"Cost"}, {name:"Billing Type/Cycle"},
	  {name:"Phone"},
      {name:"Online Account URL"},
      {name:"Username"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Gas", fields:[
	  {name:"Supply Address"},
	  {name:"Supply Postcode/Zip"},
      {name:"Provider"}, {name:"Tariff Name"}, {name:"Cost"}, {name:"Billing Type/Cycle"},
	  {name:"Phone"},
      {name:"Online Account URL"},
      {name:"Username"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Water", fields:[
	  {name:"Supply Address"},
	  {name:"Supply Postcode/Zip"},
      {name:"Provider"}, {name:"Tariff Name"}, {name:"Cost"}, {name:"Billing Type/Cycle"},
	  {name:"Phone"},
      {name:"Online Account URL"},
      {name:"Username"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Internet / Broadband", fields:[
	  {name:"Supply Address"},
	  {name:"Supply Postcode/Zip"},
      {name:"Provider"}, {name:"Package Name"}, {name:"Cost"}, {name:"Billing Type/Cycle"},
	  {name:"Phone"},
      {name:"Online Account URL"},
      {name:"Username"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Other Utility", repeat:true, fields:[
	  {name:"Supply Address"},
	  {name:"Supply Postcode/Zip"},
      {name:"Utility Type (e.g. electricity)"},
      {name:"Provider"},
      {name:"Package Name"},
      {name:"Cost"},
      {name:"Billing Type/Cycle"},
	  {name:"Phone"},
      {name:"Online Account URL"},
      {name:"Username"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Passports",
  description: "Many countries require that its citizens' passports are returned for cancellation upon their death. In the UK, you should cut the top right-hand corner off to prevent fraudulent use and then send it to HM Passport Office. You can either use the 'Tell Us Once' service if it's available or fill out a D1 form.",
  fields:[
	  {name:"Passport", repeat:true, fields:[
		{name:"Location", description:"e.g. a specific place in your home"},
		{name:"Passport Number"},
		{name:"Expiry Date"},
		{name:"Notes"}
	  ]}
  ]
},
{
  title:"Banking and Financial",
  description: "Many disputes arise over finances when someone dies. Be sure to provide unambiguous details of all your financial affairs to reduce the risk of confusion.",
  fields:[
    {name:"Bank / Savings Account", description:"This section contains particularly sensitive information. Only provide full details if you are ABSOLUTELY certain that you wish to grant access to your funds to whoever reads your DeathBox. If in ANY doubt, leave it out!", repeat:true, fields:[
      {name:"Bank"}, {name:"Branch Address"}, {name:"Sort Code"}, {name:"Account Number"},
	  {name:"Credit / Debit Card Number"},
	  {name:"Credit / Debit Card Pin", description:"Please be absolutely sure that you want to include this information!"}, 
	  {name:"Start Date"},
	  {name:"Expiry Date"},
	  {name:"CCV Code", description:"Please be absolutely sure that you want to include this information!"},
	  {name:"Card Owner Address"},
	  {name:"Card Owner Postcode/Zip"},
      {name:"Online Banking URL"},
	  {name:"Username", description:"Please be absolutely sure that you want to include this information!"},
	  {name:"Password", description:"Please be absolutely sure that you want to include this information!"},
	  {name:"Mobile Banking App"},
	  {name:"Mobile Banking App PIN / Passcode", description:"Please be absolutely sure that you want to include this information!"},
	  {name:"Notes"}
    ]},
    {name:"Direct Debit", repeat:true, fields:[
      {name:"Description"}, {name:"Amount"}, {name:"Schedule/Frequency"}, {name:"Notes"}
    ]},
    {name:"Standing Order", repeat:true, fields:[
      {name:"Description"}, {name:"Amount"}, {name:"Schedule/Frequency"}, {name:"Notes"}
    ]},
    {name:"Loan / Mortgage", repeat:true, fields:[
      {name:"Description"}, {name:"Property Address"}, {name:"Postcode/Zip"}, {name:"Total Amount"}, {name:"Total Remaining"},
      {name:"Payment Amount"}, {name:"Schedule/Frequency"}, {name:"Notes"}
    ]},
    {name:"Monies Owing", repeat:true, fields:[
      {name:"Description"}, {name:"Amount"}
    ]},
    {name:"Other Financial Information", repeat:true, fields:[
      {name:"Description"}
    ]}
  ]
},
{
  title:"Insurance Policies",
  description: "Those you leave behind may need your insurance information to make a claim. Be sure to include any important information such as provider, policy number, coverage, and expiry dates.",
  fields:[
	  {name:"Insurance Policy", repeat:true, fields:[
		{name:"Type (life, house, car, personal items etc.)"},
		{name:"Property Address"},
		{name:"Postcode/Zip"},
		{name:"Provider"},
		{name:"Reference Number"},
		{name:"Policy Description"},
		{name:"Cost"},
		{name:"Expiry Date"},
		{name:"Phone"},
		{name:"Online Account URL"},
		{name:"Username"},
		{name:"Password", description:"Please be absolutely sure that you want to include this information!"},
		{name:"Notes"}
	]}
  ]
},
{
  title:"Computing and Email",
  description: "Gaining access to somebody's phone, computer or device after their death is one of the most common practical issues faced by those they leave behind.  Many services are paid for, so providing sufficient information is crucial in closing your accounts, protecting your identity and avoiding costly posthumous bills.",
  fields:[
    {name:"Computer, Laptop or Other Device", repeat:true, fields:[
      {name:"Device Description"}, {name:"Username"}, {name:"Password/Code", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
	{name:"Network", repeat:true, fields:[
      {name:"Name", description:"e.g. Home LAN"}, {name:"Description", description:"e.g. Your home WiFi, office LAN or basement access point"}, {name:"IP Address", description:"If the network allows direct access, provide the IP address here (a domain name or URL is also allowed)"}, {name:"SSID", description:"The display name if it's a WiFi network"}, {name:"SSID Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Control Panel URL",description:"If the network has a control panel, include the URL or IP address here"}, {name:"Control Panel Username"}, {name:"Control Panel Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Microsoft, Apple, Google Account", repeat:true, fields:[
      {name:"Account Description"}, {name:"Username"}, {name:"Password/Code", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Email Account", repeat:true, fields:[
      {name:"Provider (e.g. Hotmail, Google)"}, {name:"Email Address"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Pop/IMAP etc. – precise instructions"}
    ]},
    {name:"Software – Subscription", repeat:true, fields:[
      {name:"Software Description"}, {name:"Expiry Date"}, {name:"Cost"},
      {name:"Serial Number"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Software – Online Account", repeat:true, fields:[
      {name:"Software Description"}, {name:"URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
	{name:"Software – General", repeat:true, fields:[
      {name:"Software Description"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Location of Important Files and Folders", repeat:true, fields:[
      {name:"Description"}
    ]}
  ]
},
{
  title:"Phone",
  description: "These services are usually chargeable, so leaving sufficient information to enable others to close your accounts and prevent unnecessary expenses is essential.",
  fields:[
    {name:"Landline Account", repeat:true, fields:[
      {name:"Phone Number"}, {name:"Provider"}, {name:"Account Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}
    ]},
    {name:"Mobile Account", repeat:true, fields:[
      {name:"Phone Number"}, {name:"Provider"}, {name:"Account Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}
    ]},
    {name:"Mobile Device", repeat:true, fields:[
      {name:"Device Make/Model"}, {name:"OS Type (Apple, Android)"}, {name:"Pin/Passcode", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Apple iCloud", repeat:true, fields:[
      {name:"Account Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Google / Android", repeat:true, fields:[
      {name:"Account Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Mobile App Account", repeat:true, fields:[
      {name:"App Name"}, {name:"Description"}, {name:"Account Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]}
  ]
},
{
  title:"Internet and Online Subscriptions",
  description: "The internet has become an incredibly important aspect of many people's lives – they often have multiple identities and numerous communities where they can express themselves, make friends and share their thoughts and ideas.  Try and provide enough information so that those you leave behind can log in, notify your community, and if required, close your account(s).",
  fields:[
    {name:"Social Media Account", repeat:true, fields:[
      {name:"Name (e.g. LinkedIn)"}, {name:"Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Online Shopping / Groceries", repeat:true, fields:[
      {name:"Description"}, {name:"Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Newspaper / Magazine Subscription", repeat:true, fields:[
      {name:"Description"}, {name:"Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
    {name:"Web Hosting / Domain Registrar", repeat:true, fields:[
      {name:"Description"}, {name:"Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
	{name:"Other Website Login", repeat:true, fields:[
      {name:"Description"}, {name:"Login URL"}, {name:"Username"}, {name:"Password", description:"Please be absolutely sure that you want to include this information!"}, {name:"Notes"}
    ]},
  ]
},
{
  title:"Disputes / Conflicts to Resolve",
  description: "If you wish to repair a relationship or resolve a conflict but can't face doing it while you're alive, write down the details here.",
  fields:[
    {name:"Dispute / Conflict", repeat:true, fields:[
      {name:"Description"}, {name:"Resolution"}
    ]},
  ]
},
{
  title:"Secrets",
  description: "Should you wish to do so, this section allows you to divulge any confidential information to an appointed individual after you're gone. Obviously, anyone else who reads your DeathBox will also be able to view your secrets.",
  fields:[
    {name:"Secret", repeat:true, fields:[
      {name:"Description", description:"Please be especially mindful of what you write here. Consequences resulting from information you provide could potentially harm others, destroy lives or cause disputes resulting in legal action."}, {name:"Who to Tell", description:"In addition to whoever reads your DeathBox"}
    ]},
  ]
},
{
  title:"Miscellaneous",
  description: "If you can't find an appropriate section for something, put it here.",
  fields:[
    {name:"Item", repeat:true, fields:[
      {name:"Description"}, {name:"Action"}
    ]},
  ]
}
];

/* NO FURTHER EDITING IS REQUIRED BELOW THIS POINT */

// Disable the console if debug is set to false
if (!debug){
	console.log = function() {}
}

// Custom jQuery ignore function
$.fn.ignore = function(sel) {
  return this.clone().find(sel || ">*").remove().end();
};

// This is the DeathBox logo in base64 data format (required for use in the PDF)
var pdf_logo_data = 'data:image/jpeg;base64,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x0TgJXVYxwiBePhaOLRwQauPpA6xiQtEOPLQaeYLoaSK8+La0+hBvL06dBN0dN8hkcrnMtDK+/txbjF2TpHwA62vE0jntjrI3SWto3gHO4oN6oOauvPpey2692Dcuzn20M+ScPzi0uXmJglAA+YYWtd8Q+NtK14itSg3P0r6d47p/suy27ZuEssVZb+7pQz3MnGST3cmt7mgIMuQaK6z+lzC73yM2fwF0zDbgn8V217S61uX/feG+KN5+05oNe1teKDSJ9HfWAXPkj8tMdafMC6d5fLnQx6/6qDbnSb0j4nbWSt85u69jzORtXCS2x8LSLOORpq17y8B82k8QC1o7wUHQ6AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIMO6r9MsT1H2k/b2RnktC2Zt1Z3kQDjFcRtcxrywkB7dMjmltRwPMHig5O3F6PurOOuHjFNs85b/AOikgnZbyEftMuTE1p9zz70Fx6XembrTj95YvK3bG7bgsrhks12LqGSUxNcC9jG2z5dWttW0cQO9B2igICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDzLLFDG6WV7Y42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G2t4xRrI2CjWhBVICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg0x6juh0O/sGcxh4Wt3bjIz8vSjfm4BVxt3n7w4mMnt4cjUBwrNDNBM+GZjoponFksTwWua5po5rmniCDzCDwgICAgICAgICAgICAgICAgICAgICAgICAgIIoCCCAgICAgICZEQsiNSmTCFSnUOKZMCZBYyFEEEBAQEBAQEBBfNl7Ozu8dx2e38JAZr67dSprojjHxyyO+yxg4k/VxQfQ3pn05wXT/AGrbYHEt1Fv4l7eOAElxcOAD5X091GjsbQIMrQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEHNXqg9P5y8VxvrattXKxNL83jom8bljRxuI2j/StHxj7Q4/F8QcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIKzD4fJ5nKWuKxds+7yF5IIra2iFXPe7kP5yeAHEoO/OhfRfG9NtuaZQy53Jfta7LX7RUDtEERPERs/rHiewANmICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOUvUr6cTGbvfGzLX8PxT5vERD4e19zA0dnbIwcviHCtA5YQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEFTjcbf5TIW+Ox1u+6vruRsVtbRNLnve80a1oCDuroB0DsOnmNGUyrWXW77yOlxOKOZaxu4mCE9/339vIcOYbhQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBByn6jPTSWm63lse0q06psvg4W8u109swdna+Me9vcg5XQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBBWYjEZPMZO2xeLtpLzIXbxFbW0Q1Pe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';

// Called when page is loaded (JavaScript see entry point further down)
function init(){
	
	// If not using fixed background logo (scroll effect), show the regular logo block
	$(window).on("load", function(){
		if (!useBackgroundLogo){
			$("#deathbox-logo").show();
			$(".deathbox-jumbotron").css("background-image","none");
		} else {
			// Use background image (does not blur)
			$(".deathbox-jumbotron").addClass("jumbotron-bg-logo");
		}
		if (useFixedJumbotron){
			$(".deathbox-jumbotron").addClass("jumbotron-fixed");
			$(".deathbox-main").addClass("deathbox-main-jumbotron-fixed");
		}
		if (!useFixedLogo){
			$("#deathbox-logo").addClass("deathbox-logo-scrolled");
		}
		$("#deathbox-logo-ns").hide();
	});
	// Blur the logo on scroll
	if (blurLogo){
		$(window).scroll(function(e) {
			
			var distanceScrolled = $(this).scrollTop();
		
			$('#deathbox-logo').css('filter', 'blur('+distanceScrolled/60+'px)');
			
		});
	}
	// jQuery ready handler - bind events here
	$(document).ready(function(){
		
		if (addStructuredData){
			var mainEntities = [];
		}
		// Create FAQ Table of Contents
		$(".toc").html("");
		$(".faq").find("a[name^='faq']").each(function(){
			var text = $(this).next("h3").text().replace("Q: ","");
			var href = $(this).attr("name");
			var faq_answer = $("." + href + "-answer").html();
			$(".toc").append('<li><a href="#'+href+'">'+text+'</a></li>');
			if (addStructuredData){
				// Add to rich date snippets/schema
				var richObject = {"@type":"Question","name": text,"acceptedAnswer":{"@type":"Answer","text": faq_answer}};
				mainEntities.push(richObject);
			}
		});
		
		// Create the full JSON-LD object
		if (addStructuredData){
			let jsonLd = [
				{
				"@context": "https://schema.org/",
				"@type": "WebApplication",
				"name": "DeathBoxes",
				"description":"An online application to help you create a single, comprehensive document that holds all the key information people may need when you die.",
				"applicationCategory":"LifestyleApplication",
				"operatingSystem": "Windows, Mac, Linux, iOS, Android",
				"softwareRequirements": "A modern browser",
				"author": {
					"@type": "person",
					"givenName": "Russell",
					"familyName": "McVeigh",
					"email":"hello@deathboxes.co.uk"
				},
				"downloadUrl":"https://www.deathboxes.co.uk/deathboxes-local.zip",
				"fileSize":"729KB",
				"offers": {
					"@type": "Offer",
					"price": 0.00,
					"priceCurrency": "GBP"
				}
				},
				{
					"@context": "https://schema.org/",
					"@type": "FAQPage",
					"name": "Frequently Asked Questions",
					"mainEntity": mainEntities
				}
			];
			const script = document.createElement('script');
			script.setAttribute('type', 'application/ld+json');
			script.textContent = JSON.stringify(jsonLd);
			document.head.appendChild(script);
		}
		
		// Warning when Encrypt PDF tickbox is unchecked
		$(document).on("click","#encryptOption",function(){
			if (!$(this).is(":checked")){
				var answer = confirm("We STRONGLY recommend that you encrypt your DeathBox file. Without encryption, ANYONE with access to your computer will be able to read it.\n\nAre you SURE you want to disable this feature?");
				if (answer){
					return true;
				}
				return false;
			}
		});
		
		// Warning when Only include sections marked as complete is checked
		$(document).on("click","#onlyCompleteOption",function(){
			if ($(this).is(":checked")){
				var answer = confirm("This will only include sections that you have marked as complete.\n\nAre you SURE you want to do this?");
				if (answer){
					return true;
				}
				return false;
			}
		});
		
		// Mark section as complete checkboxes
		$(document).on("click",".cb-section",function(){
			// This does nothing (everything in the form is already covered by the event handler below)
		});
		
		// Update progress data - this is a very broad net :| (handle was previously document no "#dynamicForm")
		$("#dynamicForm").on("change click keyup",":input",function(){
			updateProgressBar();
		});
		
		// Unload handler to catch user refreshing or navigating away from page
		$("#dynamicForm").on("change keyup paste blur focus",":input",function(){
			if ($('#dynamicForm :input').filter(function(){ return $.trim($(this).val()) !== ''; }).length) {
				console.log('init: #dynamicForm UNLOAD HANDLER: At least one field has a changed value');
				window.addEventListener("beforeunload", beforeUnloadHandler);
			} else {
				window.removeEventListener("beforeunload", beforeUnloadHandler);
			}
		});
		
		// Make the form sortable
		$( "#dynamicForm" ).sortable({
			handle: ".section-header",
			delay: 150,
			items: "> .section",
			cursor: "move",
			axis: "y",
			forceHelperSize: true,
			forcePlaceholderSize: true,
			containment: "parent",
			// This prevents the section opening when dragging stops
			start:function(event, ui){
				 ui.item.addClass('noclick');
			},
			update: function( event, ui ) {
				// Re-index all of the form fields
				reIndexForm();
				updateProgressBar();
			}
		});
		
		$(document).on("click",".toggle-incomplete",function(){
			$(".sections-incomplete").toggle();
			return false;
		});
		
		$(document).on("click",".toggle-empty",function(){
			$(".sections-empty").toggle();
			return false;
		});

	});
}

// Test whether a field should be a textarea based on its name string
function isTextarea(name){
	// Hacky, I know!
	if (name == "IP Address"){
		return false;
	}
	return /Action|Address|Comments|Declaration|Description|Details|Eulogy Text|Instructions|Location|Notes|Obituary Text|Residuary Clause|Resolution|Target Publications/i.test(name);
}

// Unload handler to catch refresh or user navigating away
const beforeUnloadHandler = (event) => {
  // Recommended
  event.preventDefault();
  // Included for legacy support, e.g. Chrome/Edge < 119
  event.returnValue = true;
};

// Update progress bar
function updateProgressBar(){
	
	console.log("updateProgressBar called");
	
	var totalFields = 0;
	var notEmpty = 0;
	var totalSections = 0;
	var sectionsHaveData = 0;
	var sectionsEmpty = [];
	var sectionsMarkedComplete = 0;
	sectionsMarkedArray = [];
	sectionsNotMarkedArray = [];
	
	$(".empty-section-link").unbind("click");
	
	// Sections marked complete via checkbox
	$(".section").find(".cb-section").each(function(){
		if ($(this).is(":checked")){
			sectionsMarkedComplete++;
			sectionsMarkedArray.push($(this).attr("data-section"));
		} else {
			sectionsNotMarkedArray.push($(this).attr("data-section"));
		}
	});
	
	// Tally up total/empty fields
	$("#dynamicForm").find("input, textarea").not(".cb-section").each(function(){
		totalFields++;												 
	 	$(this).attr("value", $(this).val());
		if ($(this).attr("value") !== ""){
			notEmpty++;
		}
	});
	
	// Tally up sections that have empty fields
	$("#dynamicForm").find(".section").each(function(){
		totalSections++;												 
		var section_name = $(this).find(".section-header").ignore("span").text();
		var sectionDone = false;
		$(this).find("input, textarea").not(".cb-section").each(function(){
			if ($(this).attr("value") !== ""){
				sectionDone = true;
			}
		});
		if (sectionDone){
			sectionsHaveData++;
		} else {
			sectionsEmpty.push(encodeURIComponent(section_name));
		}
	});
	
	// Calculate percentage of form complete and update visual feedback (small green progress bar at top of screen)

	// Use mark as complete to override complete section percentage
	var progressPercentMarkedComplete = (sectionsMarkedComplete/totalSections) * 100;
	$(".percent-complete-marked").text(progressPercentMarkedComplete.toFixed(0) + "%");
	$(".progress-bar-marked").css("width",progressPercentMarkedComplete.toFixed(2) + "%");
	$(".progress-bar-marked").attr("title",sectionsMarkedComplete + " of the " + totalSections + " sections are marked as complete");
	$(".progress-legend-marked").attr("title",sectionsMarkedComplete + " of the " + totalSections + " sections are marked as complete");
	
	// This is for the 'Save Progress' section
	var progressPercentSection = (sectionsHaveData/totalSections) * 100;
	$(".percent-complete-sections").text(progressPercentSection.toFixed(0) + "%");
	$(".progress-bar-sections").css("width",progressPercentSection.toFixed(2) + "%");
	$(".progress-bar-sections").attr("title",sectionsHaveData + " of the " + totalSections + " sections contain data");
	$(".progress-legend-sections").attr("title",sectionsHaveData + " of the " + totalSections + " sections contain data");
	
	// Fields complete
	var progressPercent = (notEmpty/totalFields) * 100;
	$(".percent-complete").text(Math.ceil(progressPercent).toFixed(0) + "%");
	$(".progress-bar-fields").css("width",progressPercent.toFixed(2) + "%");
	$(".progress-bar-fields").attr("title",notEmpty + " of the " + totalFields + " fields contain data");
	$(".progress-legend-fields").attr("title",notEmpty + " of the " + totalFields + " fields contain data");
	
	var marked_html = (sectionsNotMarkedArray.length == 1) ? "section is not yet marked as complete" : "sections are not yet marked as complete";
	$(".incomplete-text").text(marked_html);
	$(".incomplete-count").text(sectionsNotMarkedArray.length);

	var empty_html = (sectionsEmpty.length == 1) ? "section is completely empty" : "sections are completely empty";
	$(".empty-text").text(empty_html);
	$(".empty-count").text(sectionsEmpty.length);
	
	// Calculate z-index of different progress bar layers (lowest value = highest z-index)
	var progressArray = [{bar:".progress-bar-fields",value:progressPercent},{bar:".progress-bar-sections", value:progressPercentSection},{bar:".progress-bar-marked", value:progressPercentMarkedComplete}];
	
	// Reverse sort percentages (highest to lowest)
	var sortedProgressArray = progressArray.sort(function(a, b) {
	  return b.value - a.value;
	});
	
	// Enumerate new array and set increasing z-index
	var zindex = 10;
	for(b in sortedProgressArray){
		$(sortedProgressArray[b].bar).css("z-index",zindex);
		zindex += 10;
	}
	
	if (showEmptyProgressLegend){
		var emptyPercent = 100 - sortedProgressArray[0].value; 
		$(".progress-legend-empty-wrapper").css("display","inline-table");
		$(".percent-empty").text(Math.floor(emptyPercent).toFixed(0) + "%");
	}
	
	// Clear down the receiving element
	$(".sections-empty").html("");
	for(i in sectionsEmpty){
		$(".sections-empty").append('<a href="#" class="empty-section-link" rel="'+sectionsEmpty[i]+'">'+decodeURIComponent(sectionsEmpty[i])+'</a><br>');
	}
	
	$(".sections-incomplete").html("");
	for(i in sectionsNotMarkedArray){
		$(".sections-incomplete").append('<a href="#" class="empty-section-link" rel="'+sectionsNotMarkedArray[i]+'">'+decodeURIComponent(sectionsNotMarkedArray[i])+'</a><br>');
	}
	
	
	// Show sections that contain no data with a link to scroll to them
	$(".empty-section-link").on("click", function(event){
		var section_text = decodeURIComponent($(this).attr("rel"));
		$('html').animate({
			scrollTop: $(".section-header:contains('"+section_text+"')").offset().top
		}, 500, function(){
			var section = $(".section-header:contains('"+section_text+"')").parent();
			
			if(!section.find(".section-content").is(":visible")){
				//console.log("Section '"+section_text+"' is collapsed, opening");
				section.find(".section-content").show();
				section.find(".section-header").addClass("pink");
				section.find(".section-header").find("span").text('▼');
			}
		});
		return false;
	});
	
}

// Create section/field HTML
function createField(field){
	
    const wrapper=document.createElement('div');
	wrapper.className='field';

	// Compare number of subsection fields with original formData
	if(!firstload && loading && field.fields && field.fields.length > 0){
		
		var new_fields = compareFields(current_section_title,field); // field is an array
		
		if (new_fields.length > 0){
			if (!mergeConfirm){
				var new_confirm = confirm("At least one new field has been added since you last saved (including '"+new_fields[0].name+"' in the '"+current_section_title+"' section).\n\nThis is not an error! It's because I've updated the base template.\n\nDo you wish to include the new field(s) now? Doing so will NOT overwrite any of your existing information.");
				if (new_confirm){
					mergeConfirm = true;
					field.fields = field.fields.concat(new_fields);
				} else {
					// Skipped - do not add new fields
					mergeConfirm = true;
				}
			} else {
				field.fields = field.fields.concat(new_fields);
			}
		}
	} else {
		console.log("createField: field comparison for "+current_section_title+" section skipped");
	}
	
    if(field.repeat){
		
		console.log("createField: Repeatable Field: " + field.name);
		
        const container=document.createElement('div');
		container.className='repeatable-container';
        const addButton=document.createElement('button');
		addButton.type='button';
		addButton.className='repeatable-btn';
		addButton.title='Add another ' + field.name;
		addButton.textContent=`Add ${field.name}`;
        container.appendChild(addButton);

        const addInstance=(idx)=>{
            const instance=document.createElement('div');
			instance.className='repeatable-instance';
            const instanceHeader=document.createElement('div');
			instanceHeader.className='subsection';
			
			var thisField = `${field.name} (${idx+1})`;
			thisField = thisField.replace(/ *\([^)]*\) */g, "");
			
			console.log("createField: ADDING Field: " + thisField);
			
			if (loading && lastField == thisField){
				dupecount++;
				subSectionFields[thisField] = dupecount;
				var len = subSectionFields[thisField];
				instanceHeader.textContent=`${field.name} (${idx+1+len})`;
				instance.appendChild(instanceHeader);
				console.log("createField: Duplicated Subsection Detected: " + lastField);
				console.log("createField: Header: " + `${field.name} (${idx+1+len})`);
				subSectionFields[thisField] = idx+1+len;
				console.log("createField: Dupecount: " + dupecount);
				console.log("createField: subSectionFields[thisField]: " + subSectionFields[thisField]);
				
				// Subsection descriptions
				if (field.description){
					const subsectionDescription = document.createElement('div');
					subsectionDescription.className='subsection-description';
					subsectionDescription.textContent=field.description;
					instance.appendChild(subsectionDescription);
				}
				
				// Remove any duplicate buttons
				dupe = true;
			} else {
				dupecount = 0;
				if (isNaN(subSectionFields[thisField])){
					len = 0;
					subSectionFields[thisField] = 0;
				} else {
					len = subSectionFields[thisField];
				}
				console.log("createField: subSectionFields[thisField]: " + subSectionFields[thisField]);
				console.log("createField: Adding New Subsection: " + `${field.name} (${len+1})`);
				console.log("createField: Existing Subsections Length: " + len);
				dupecount = 0;
				fCount = 0;
				instanceHeader.textContent=`${field.name} (${len+1})`;
				instance.appendChild(instanceHeader);
				subSectionFields[thisField] = len+1;
				len = subSectionFields[thisField];
				console.log("createField: New Subsections Length: " + len);
				dupe = false;
				
				// Subsection descriptions
				if (field.description){
					const subsectionDescription = document.createElement('div');
					subsectionDescription.className='subsection-description';
					subsectionDescription.textContent=field.description;
					instance.appendChild(subsectionDescription);
				}
				
			}
			
			lastField = `${field.name} (${idx+1})`;
			lastField = lastField.replace(/ *\([^)]*\) */g, "");

            if(field.fields && field.fields.length > 0){
                field.fields.forEach(f=>instance.appendChild(createField(f)));
            } else {
                const label = document.createElement('label');
                label.textContent = field.name;
                const input = isTextarea(field.name)?document.createElement('textarea'):document.createElement('input');
                input.name = `${field.name}[${idx}]`;
				if (loading || firstload){
					if (field.value){
						input.value = field.value;
					}
					if (field.description){
						input.title = field.description;
						// Add individual field description
						const fieldDescription = document.createElement('div');
						fieldDescription.className='field-description';
						fieldDescription.textContent=field.description;
						label.appendChild(fieldDescription);
					}
					console.log("createField: Populate field: " + field.value);
				}
				if (field.id){
					input.id = field.id;
				} else {
					input.id = fid;
					fid++;
				}
                //label.appendChild(document.createElement('br'));
                label.appendChild(input);
                instance.appendChild(label);
            }

            const removeBtn=document.createElement('button');
			removeBtn.type='button';
			removeBtn.className='remove-btn';
			removeBtn.textContent='Remove';
            removeBtn.onclick=()=>{
				// Only allow subsection removal if there's more than one left
				if (subSectionFields[thisField] > 1){
					instance.remove();
					// Decrement count for this field
					subSectionFields[thisField] = subSectionFields[thisField]-1;
					reIndexForm();
					updateProgressBar();
				} else {
					alert("Only added fields can be removed!");
				}
			}
			// Only add remove button if more than one subsection (i.e. if user has added one)
			if (subSectionFields[thisField] > 1){
				instance.appendChild(removeBtn);
			}
            container.insertBefore(instance, addButton);
        };

        addButton.onclick=()=>{
			addInstance(container.querySelectorAll('.repeatable-instance').length);
			// Make specific warning descriptions red
			$(".field-description:contains('Please be absolutely sure that you want to include this information!')").addClass("warning");
			$(".field-description:contains('Please be especially mindful of what you write here. Consequences resulting from information you provide could potentially harm others, destroy lives or cause disputes resulting in legal action.')").addClass("warning");
			reIndexForm();
			updateProgressBar();
		};
        addInstance(0); wrapper.appendChild(container);
    } // End if repeating field
    else if(field.fields){
        const subHeader=document.createElement('div');
		subHeader.className='subsection';
		subHeader.textContent=field.name;
		wrapper.appendChild(subHeader);
		// Subsection descriptions
		if (field.description){
			const subsectionDescription = document.createElement('div');
			subsectionDescription.className='subsection-description';
			subsectionDescription.textContent=field.description;
			wrapper.appendChild(subsectionDescription);
		}
			
        field.fields.forEach(f=>wrapper.appendChild(createField(f)));
    }
    else{
        const label=document.createElement('label');
		label.textContent=field.name;
        const input=isTextarea(field.name)?document.createElement('textarea'):document.createElement('input');
		input.name=field.name;
		if (loading || (firstload && field.value)){
			if (field.value){
				input.value = field.value;
			}
			console.log("createField: Populate field: " + field.value);
		}
		if (field.description){
			input.title = field.description;
		}
		
		if (field.description){
			// Add individual field description
			const fieldDescription = document.createElement('div');
			fieldDescription.className='field-description';
			fieldDescription.textContent=field.description;
			label.appendChild(fieldDescription);
		}
		
		if (field.id){
			input.id = field.id;
		} else {
			input.id = fid;
			fid++;
		}
        //label.appendChild(document.createElement('br'));
		label.appendChild(input);
		
        wrapper.appendChild(label);
		wrapper.dataset.label=field.name;
		
    }
    return wrapper;
}

// JAVASCRIPT ENTRY POINT

// Hide noscript notice
document.getElementById("noscript").style.display = 'none';

// Init jsPDF
const { jsPDF } = window.jspdf;

// Keep submitted form data in-memory
const ephemeralFormData = [];

// For resetting form to original state
const origFormData = [...formData];
//const origFormData = formData;

// Call the initialisation function
init();
const formEl=document.getElementById('dynamicForm');
var s = 0; // Section count
var fid = 0; // Field count
var current_section_title = null;
var lastField = null;
var fCount = 0;
var loading = false; // Whether currently loading a file
var firstload = true; // Whether it's the initial load
var mergeConfirm = false;
var subSectionFields = [];
var dupe = false;
var dupecount = 0;
var sections = [];
var sectionsMarkedArray = [];

// Create the main form
createForm();

// Construct the HTML form using the formData array (either default or a loaded progress file)
function createForm(){
	formEl.innerHTML = '';
	
	// Enumerate the form data and build the HTML for all the elements
	formData.forEach(section=>{
		
		const sec=document.createElement('div');
		sec.className='section';
		sec.id='section_'+s;
		const header=document.createElement('div');
		header.className='section-header';
		header.title = section.description;
		//
		header.textContent=section.title;
		const toggle=document.createElement('span');
		toggle.style.marginLeft='10px';
		toggle.textContent='►'; header.appendChild(toggle);
		
		const content=document.createElement('div');
		content.className='section-content';
		
		// Add section description if it's available	
		if (section.description){
			const sectionDescription=document.createElement('div');
			sectionDescription.className='section-description';
			sectionDescription.textContent=section.description;
			content.appendChild(sectionDescription);
		}

		current_section_title = section.title;
		
		// Compare number of section fields with original formData
		if(!firstload && loading && section.fields && section.fields.length > 0){
			console.log("createField calling compareSections...");
			var new_fields = compareSections(current_section_title,section); // section is an array
			
			if (new_fields.length > 0){
				if (!mergeConfirm){
					var new_confirm = confirm("At least one new field has been added since you last saved (including '"+new_fields[0].name+"' in the '"+current_section_title+"' section).\n\nThis is not an error! It's because I've updated the base template.\n\nDo you wish to include the new field(s) now? Doing so will NOT overwrite any of your existing information.");
					if (new_confirm){
						mergeConfirm = true;
						section.fields = section.fields.concat(new_fields);
					} else {
						// Skipped - do not add new fields
						mergeConfirm = true;
					}
				} else {
					section.fields = section.fields.concat(new_fields);
				}
			}
		} else {
			console.log("createField: section field comparison for "+current_section_title+" section skipped");
		}
		
		// Add fields
		if(section.fields) section.fields.forEach(f=>content.appendChild(createField(f)));
		
		// Expand/Collapse sections by clicking on their headers
		content.style.display='none';
		header.onclick=()=>{
			$this = $(header).parent();
			if ($this.hasClass("noclick")){
				$this.removeClass("noclick");
				return false;
			}
			if(content.style.display==='none'){
				content.style.display='block';
				header.className = "section-header pink";
				toggle.textContent='▼';
			} else{
				content.style.display='none';
				toggle.textContent='►';
				header.className = "section-header";
			}
		};
		sec.appendChild(header);
		sec.appendChild(content);
		formEl.appendChild(sec);
		
		// Remove duplicate 'Add' buttons for repeatable sections
		if (loading && dupe){
			for(i in subSectionFields){
				var btnstr = "Add " + i;
				console.log("createForm: Remove duplicate button: " + btnstr);
				$("button:contains('"+btnstr+"')").not(':last').remove();
			}
		}
		// Increase
		s++;
	});
	
	firstload = false;
	loading = false;
	dupe = false;
	dupecount = 0;
	mergeConfirm = false;
	
	// Make specific warning descriptions red
	$(".field-description:contains('Please be absolutely sure that you want to include this information!')").addClass("warning");
	$(".field-description:contains('Please be especially mindful of what you write here. Consequences resulting from information you provide could potentially harm others, destroy lives or cause disputes resulting in legal action.')").addClass("warning");
	
	// Add a checkbox to each section
	$(".section").each(function(){
		var sec_id = $(this).attr("id");
		var cb_id = sec_id.replace("section","cb");
		var sec_title = $(this).find(".section-header").ignore("span").text();
		$(this).prepend('<input class="cb-section" data-section="'+encodeURIComponent(sec_title)+'" title="Mark section as complete" type="checkbox" value="on" id="'+cb_id+'">');
	});
	
	// Reset all the checkboxes first
	$(".cb-section").prop("checked",false);
	
	// If sectionsMarkedArray is present, check the marked as complete checkbox
	if (sectionsMarkedArray.length > 0){
		for (i in sectionsMarkedArray){
			$(".cb-section[data-section='"+sectionsMarkedArray[i]+"']").prop("checked",true);
		}
	}
	
	// Expand/Collapse
	let expanded=false;
	document.getElementById('expandCollapseAll').onclick=()=>{
		document.querySelectorAll('.section-content').forEach(s=>{
			s.style.display=expanded?'none':'block';
			s.previousElementSibling.querySelector('span').textContent=expanded?'►':'▼';
			s.previousElementSibling.className=expanded?'section-header':'section-header pink';
		});
		expanded=!expanded;
		document.getElementById('expandCollapseAll').textContent=expanded?'Collapse All Sections':'Expand All Sections';
	};
	console.log("createForm about to call reIndexForm() and updateProgressBar()");
	reIndexForm();
	updateProgressBar();
}

// This performs a deep comparison between the template and loaded data to check if there's any new fields
function compareSections(title,section){
	
	console.log("compareSections: Comparing fields for section: " + title);
	
	// Get saved section field length
	console.log(section.fields);

	// New fields stack
	var newFields = [];
	for (o in origFormData){
		if (origFormData[o].title == title){
			console.log("compareSections: Original section length: " + origFormData[o].fields.length);
			console.log("compareSections: Saved section length: " + section.fields.length);
			
			var orig_section = origFormData[o];
			var diffArray = orig_section.fields.filter(o=> !section.fields.some(i=> i.name === o.name));
			
			if (diffArray.length > 0){
				console.log("compareSections: New fields were found in '" + title + "'");
				for(d in diffArray){
					console.log("compareSections: Adding new field: " + diffArray[d].name);
					newFields.push(diffArray[d]);
				}	
			}
		}
	}
	return newFields;
}

// This performs a deep comparison between the template and loaded data to check if there's any new fields
function compareFields(title,fields){
	
	console.log("compareFields: Comparing fields for section: " + title);
	
	// New fields stack
	var newFields = [];
	for (o in origFormData){
		if (origFormData[o].title == title){

			// Loop through subsection's fields
			var orig_section = origFormData[o];
			
			for (f in orig_section.fields){
				var orig_field = orig_section.fields[f];
				if (orig_field.name == fields.name){
					console.log("compareFields: Original Field " + orig_field.name + ", Original Length: " + orig_field.fields.length);
					console.log("compareFields: Loaded Field " + fields.name + ", Loaded Length " + fields.fields.length);
					if (orig_field.fields.length > fields.fields.length){
						console.log("compareFields: *** New field discovered in '" + title + "' subsection ***");
						var diffArray = orig_field.fields.filter(o=> !fields.fields.some(i=> i.name === o.name));
						// Differences were found, add to nfew field stack
						if (diffArray.length > 0){
							for(d in diffArray){
								console.log("compareFields: Adding new field: " + diffArray[d].name);
								newFields.push(diffArray[d]);
							}	
						}
						
					}
				}	
			}
		}
	}
	return newFields;
}

// ---------------- PDF ----------------

// Create a download (either an encrypted *.enc file or an unencrypted PDF)
async function generatePDFFromForm() {
	
	// Make some very basic sanity checks
	
	// Person appointed to open the deathbox is present
	if(!$("#db-designated-name").val()){
		alert("You need to provide the name of the person appointed to open your DeathBox in the 'DeathBox Settings' section.");
		return false;
	}
	
	// No custom message
	if(!$("#db-foreword-text").val()){
		alert("You need to provide a custom message to the person who opens your DeathBox in the 'DeathBox Settings' section.");
		return false;
	}
	// No custom signoff
	if(!$("#db-foreword-signoff").val()){
		alert("You need to provide a custom sign-off name in the 'DeathBox Settings' section.");
		return false;
	}
	
	// The DeathBox owner's name
	if(!$("#db-you-name").val()){
		alert("You need to provide your full name in the 'You and Your Dearest' section.");
		return false;
	}
	
	// Warn about emptying of fields
	var answer = confirm("Downloading a PDF (plain or encrypted) will completely CLEAR and RESET the form data. If you do not save it when prompted, ALL of the information you have entered will be deleted.\n\nIf you wish to save your progress instead, click 'Cancel' and use the 'Save Progress' option above.\n\nAre you still SURE?");
	if (!answer){
		return false;
	}
	
	// This method clones the main form's DOM into a temporary DIV to build the PDF structure
	// This allows us to strip elements out (such as inputs and buttons)
    const container = document.getElementById('pdfRender');
    container.innerHTML = '';

    document.querySelectorAll('.section').forEach(sec => {
												  
		// Only include marked as complete if checkbox is ticked
		if ($("#onlyCompleteOption").is(":checked")){
			var $el = $(sec);
			if (!$el.find(".cb-section").is(":checked")){
				return false;
			}
		}
        const secDiv = document.createElement('div');
        secDiv.style.marginBottom = '1rem';
        const secTitle = sec.querySelector('.section-header').childNodes[0].textContent.trim();
		secDiv.setAttribute("data-title",secTitle);
        const h2 = document.createElement('h2');
        h2.textContent = secTitle;
        secDiv.appendChild(h2);
		// See if we've got a section description
		
		let descLen = sec.querySelectorAll('.section-description').length;
		if (descLen > 0){
			const secDesc = sec.querySelector('.section-description').textContent.trim();
			if (secDesc !== ""){
				const secDescDiv = document.createElement('p');
				secDescDiv.textContent = secDesc;
				secDescDiv.style.fontColor = '#666666';
				secDiv.appendChild(secDescDiv);
			}
		}
		
		// The processNode function does all the legwork for each main section of the form
        processNode(sec.querySelector('.section-content'), secDiv, 0);
        container.appendChild(secDiv);
    });

	// Instantiate the jsPDF class
    const pdf = new jsPDF({ unit:'mm', format:'a4', orientation:'portrait' });
	
	// Add outline
	var node = pdf.outline.add(null, 'Sections', null);
	
	// Initial top margin
    let y = 20;
    const lineHeight = 7;
    const pageHeight = pdf.internal.pageSize.getHeight();
	var currentPage = 1;
	pdf.outline.add(node, 'Introduction', {pageNumber:1});
	
	// Helper function to write block of text
    function writeText(text, fontStyle='normal', fontSize=12, indent=0, textColour='black'){
        pdf.setFont('helvetica', fontStyle);
        pdf.setFontSize(fontSize);
		pdf.setTextColor(textColour);
        const lines = pdf.splitTextToSize(text, 180 - indent);
        lines.forEach(line=>{
            if(y + lineHeight > pageHeight - 10){
                pdf.addPage();
				currentPage++;
                y = 10;
            }
            pdf.text(line, 15 + indent, y);
            y += lineHeight;
        });
    }
	
	// Add flyleaf page with Deathbox logo (preferably with a black background)
	/*
	var title = 'DeathBox: A Simple Afterlife Archive';
	writeText(title, 'bold', 22, 0, '#000000');
	y = y + 50;
	*/
	// Add image (values are in mm)
	pdf.addImage(pdf_logo_data, "jpg", 19, 52, 170, 142, undefined, 'none');
	
	pdf.addPage();
	currentPage++;
	
	// Add Title and intro etc.
	var title = 'DeathBox – ' + $("#db-you-name").val();
	writeText(title, 'bold', 22, 0, '#000000');
	y = y + 20;
	// FAO strapline
	var fao = 'FOR THE SOLE ATTENTION OF: ' + $("#db-designated-title").val() + ' ' + $("#db-designated-name").val();
	writeText(fao, 'bold', 17, 0, '#CC0000');
	y = y + 20;
	
	var firstname = $("#db-you-name").val().split(/(\s+)/)[0];
	
	var foreword = $("#db-foreword-text").val();
	writeText(foreword, 'normal', 16, 0, '#000000');
	y = y + 10;
	
	var signoff = $("#db-foreword-signoff").val();
	writeText(signoff, 'normal', 16, 0, '#000000');
	//y = y + 150;
	
	var a = 0;
    Array.from(container.childNodes).forEach(secDiv => {
		a++;
		// Skip "DeathBox Settings" section - if the name changes in formData, this breaks :(
		if (secDiv.getAttribute("data-title") == "DeathBox Settings"){
			return false;
		}
		// Add new page for this section
		pdf.addPage();
		currentPage++;
		y = 20;
		
		if (secDiv.querySelector('h1')){
        	writeText(secDiv.querySelector('h1').textContent, 'bold', 20, 0, '#000000');
		}
		
		if (secDiv.querySelector('h2')){
        	writeText(secDiv.querySelector('h2').textContent, 'bold', 18, 0, '#0078d7');
			pdf.outline.add(node, secDiv.querySelector('h2').textContent, {pageNumber:currentPage});
		}
		//writeText("", 'normal', 6, 0);
		y = y + 3;
        Array.from(secDiv.childNodes).forEach(node=>{
			if(node.tagName==='P'){
				writeText(node.textContent, 'normal', 12, 0, '#666666');
			}
            if(node.tagName==='DIV'){
                // No indent for subsections (bold headers), indent for leaf values
                const strongEl = node.querySelector('strong');
                const isSubsection = strongEl ? true : false;
				if(isSubsection) y += 3;
				if(!isSubsection) y += 2;
                const fontStyle = isSubsection ? 'bold' : 'normal';
                const indent = isSubsection ? 0 : parseInt(node.style.marginLeft) || 0;

                writeText(node.textContent, fontStyle, 14, indent);

                // Add a blank line after each subsection
                if(isSubsection) y += 3;
            }
        });
        //y += 5; // extra spacing after section
    });
	
	// Add date to bottom of PDF
	const d = new Date();
	let datetext = d.toUTCString();
	y += 15;
	pdf.line(10, y, 200, y);
	y += 8;
	
	writeText('Date Generated: ' + datetext, 'normal', 14, 0);
	y += 10;
	// Add link to deathboxes (primarily so the reader can get more information)
	var info = "For more information about DeathBoxes, including how to create, upload and decrypt them, please visit https://www.deathboxes.co.uk.";
	writeText(info, 'normal', 14, 0);
	
	let date = new Date().toISOString();
	let fdate = date.split("_").join("-").replace(/T/, '-').replace(/:/g, '-').replace(/\..+/, '') + "-utc";
	// Build the PDF filename (based on name field - id = 12)
	let pname = ($("#db-you-name").val()) ? $("#db-you-name").val().replace(/ /g,"-") + "-deathbox" : "unknown-person-deathbox";
	
	// If option is checked, download an encrypted *.enc file
    if(encryptOption.checked){
        const arrayBuffer = await pdf.output('arraybuffer');
		//createChecksum(arrayBuffer);
        const passphrase = prompt('Enter passphrase to encrypt PDF:');
        if(!passphrase){
			const container = document.getElementById('pdfRender');
    		container.innerHTML = '';
			alert('Encryption cancelled');
			return;
		}
        const encryptedData = await encryptData(arrayBuffer, passphrase);
		let checksum = await createChecksum(encryptedData);
		let size = encryptedData.length;
		let filename = pname + "-" + fdate + ".enc";
		status.innerHTML='Encrypted PDF successfully generated<br><small class="description"><strong>Size:</strong> ' +size+' bytes</small><br><small class="description"><strong>Checksum:</strong> ' + checksum + '</small><br><small class="description"><strong>Note:</strong> No data is kept in memory or storage. If you do NOT download the file to your computer or device when prompted, it will no longer exist.</small>';
		status.className='success';
        triggerDownload(encryptedData,filename,'application/octet-stream');
		alert("Remember! The form will now be completely cleared and reset for security reasons.");
    } else {
		// Else download an unencrypted PDF
		let size = pdf.output().length;
		let checksum = await createChecksum(pdf.output('arraybuffer'));
		let filename = pname + "-" + fdate + ".pdf";
        pdf.save(filename);
        status.innerHTML='PDF successfully generated<br><small class="description"><strong>Size:</strong> ' +size+' bytes</small><br><small class="description"><strong>Checksum:</strong> ' + checksum + '</small><br><small class="description"><strong>Note:</strong> No data is kept in memory or storage. If you do not download the file to your computer or device when prompted, it will no longer exist.</small>';
		status.className='success';
		alert("Remember! The form will now be completely cleared and reset for security reasons.");
    }
	delete pdf;
    clearFormData();
}

function addDocLine(){
	const br = document.createElement('div');
	br.textContent = ``;
	return br;
}

// Used in PDF creation
function processNode(node, container, indentLevel = 0) {
    const leafIndent = indentLevel * 10; // indent only leaf nodes

    node.childNodes.forEach(el => {
        if (el.nodeType !== 1) return; // skip non-elements
        if (el.tagName === 'BUTTON') return; // skip buttons

        // Subsection header
        if (el.classList.contains('subsection')) {
            const div = document.createElement('div'); 
            div.style.marginLeft = '0px';
			div.style.marginTop = '5px';
			div.style.marginBottom = '5px';
            const strong = document.createElement('strong'); 
            strong.textContent = el.textContent;
            div.appendChild(strong); 
            container.appendChild(div);
        }
        // Repeatable container or instance: recurse
        else if (el.classList.contains('repeatable-instance') || el.classList.contains('field') || el.classList.contains('repeatable-container')) {
            const startChildCount = container.childNodes.length;
            processNode(el, container, indentLevel + (el.classList.contains('repeatable-instance') ? 1 : 0));

            // Only add line break if this container added leaf values
            if (container.childNodes.length > startChildCount) {
                const br = document.createElement('br');
				br.textContent = ``;
                container.appendChild(br);
            }
        }
        // Leaf input/textarea
        else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const div = document.createElement('div'); 
            div.style.marginLeft = 5 + 'px';
            const label = el.name || '(field)';
			if (el.name == "Date" || el.name == "Signature" || el.name == "Testator Signature"){
				div.textContent = `${label}: `;
				const sig = document.createElement('div');
				sig.style.paddingTop = 20 + 'px';
				sig.style.marginLeft = 5 + 'px';
				sig.textContent = `______________________________`;
				if (el.name != "Date"){
					container.appendChild(sig);
				}
			} else {
            	div.textContent = `${label}: ${el.value || '(empty)'}`;
			}
            container.appendChild(div);
			// Create spaces and lines for adding physical signatures
			if (el.name == "Date" || el.name == "Signature" || el.name == "Testator Signature"){
				console.log("processNode: Adding date/signature space");
				if (el.name != "Date"){
					container.appendChild(addDocLine());
					container.appendChild(addDocLine());
				}
				const sig = document.createElement('div');
				sig.style.paddingTop = 20 + 'px';
				sig.style.marginLeft = 5 + 'px';
				sig.textContent = `______________________________`;
				container.appendChild(sig);
			}
        }
        // Generic container: recurse
        else if (el.childNodes.length > 0) {
            processNode(el, container, indentLevel);
        }
    });
}

// Save progress (convert formData to JSON, encrypt and then force a download)
async function saveProgress(){
	var savedFormData = new Array();
	var completedResponses = 0;
	
	// Clear down in-memory array/objects
	for (const k in ephemeralFormData) {
		delete ephemeralFormData[k];
	}
	ephemeralFormData.length = 0;
	
	// Wrangle the date into a workable format (YYYY-MM-DD-hh-mm-ss-ms)
	let date = new Date().toISOString();
	let fdate = date.split("_").join("-").replace(/T/, '-').replace(/:/g, '-').replace(/\..+/, '') + "-utc";
	// Build the PDF filename (based on name field - id = 9)
	let pname = ($("#db-you-name").val()) ? $("#db-you-name").val().replace(/ /g,"-") + "-deathbox-progress" : "unknown-person-deathbox-progress";
	
	$("input, textarea").each(function(){
		$(this).attr("value", $(this).val());
	});

	$(".section").each(function(){
		var d = {};
		d.title = $(this).find(".section-header").ignore("span").text();
		d.description = $(this).find(".section-description").text();
		d.fields = [];
		$(this).find(".field").each(function(){
			// repeatable-container
			var repeat = false;
			if ($(this).find(".repeatable-container").length > 0){
				repeat = true;
			}
			// Repeated (dynamically added fieldset)
			if ($(this).find(".subsection").length > 1){
				$(this).find(".subsection").each(function(){
					var subsection = $(this).not("span").text();
					subsection = subsection.replace(/ *\([^)]*\) */g, "");
					var ssdesc = $(this).find(".subsection-description").text();
					if ($(this).parent().find(".field").length > 0){
						var subfields = [];
						$(this).parent().find(".field").each(function(){	
							var value = $(this).find(":input").attr("value");
							var description = $(this).find(":input").attr("title");
							var id = $(this).find(":input").attr("id");
							//console.log(value);
							if (value !== ""){
								completedResponses++;
							}
							subfields.push({name:$(this).attr("data-label"), value:value, description:description, id:id});
						});
						if (repeat){
							d.fields.push({name:subsection, description:ssdesc, repeat:true, fields:subfields});
						} else {
							d.fields.push({name:subsection, description:ssdesc, fields:subfields});
						}
					}
				});
			} else {
				var subsection = $(this).find(".subsection").text();
				subsection = subsection.replace(/ *\([^)]*\) */g, "");
				var ssdesc = $(this).find(".subsection-description").text();
				if ($(this).find(".field").length > 0){
					var subfields = [];
					$(this).find(".field").each(function(){
						var value = $(this).find(":input").attr("value");
						var description = $(this).find(":input").attr("title");
						var id = $(this).find(":input").attr("id");
						//console.log(value);
						if (value !== ""){
							completedResponses++;
						}
						subfields.push({name:$(this).attr("data-label"), description:description, value:value, id:id});
					});
					if (repeat){
						d.fields.push({name:subsection, description:ssdesc, repeat:true, fields:subfields});
					} else {
						d.fields.push({name:subsection, description:ssdesc, fields:subfields});
					}
				}
			}
		});
		ephemeralFormData.push(d);
	});
	// Finally, add the marked sections to the array
	ephemeralFormData.push(sectionsMarkedArray);
	
	// Sanity check the length of the formData array (it should be the original length + 1)
	if (ephemeralFormData.length != (origFormData.length + 1)){
		console.log("saveProgress: Sanity check compare ephemeralFormData and origFormData lengths: " + ephemeralFormData.length + " = " + origFormData.length);
		var continue_confirm = confirm("Eek! There appears to be a mismatch between the number of visible sections and the data you are about to save. This may be due to corruption.\n\nIf you continue by clicking 'OK', the file you generate may not reload properly.\n\nDo you still want to save your progress?");
		if (!continue_confirm){
			alert("Action cancelled. Try refreshing the page and loading your file again. Alternatively, try loading a different progress file.");
			return false;
		}
	}
	
	var json = JSON.stringify(ephemeralFormData);
	//console.log("ephemeralFormData JSON: " + json);
	
	var formHTML = str2ab(json);
	// Always encrypt HTML form progress
	const passphrase = prompt('Enter passphrase to encrypt and download progress:');
	if(!passphrase){ alert('Encryption cancelled'); return; }
	const encryptedData = await encryptData(formHTML, passphrase);
	let checksum = await createChecksum(encryptedData);
	let size = encryptedData.length;
	let filename = pname + "-" + fdate + ".enc";
	triggerDownload(encryptedData,filename,'application/octet-stream');
	statusSave.innerHTML='Encrypted progress file successfully generated ('+completedResponses+' non-empty values)<br><small class="description"><strong>Size:</strong> ' +size+' bytes</small><br><small class="description"><strong>Checksum:</strong> ' +checksum+'</small><br><small class="description"><strong>Note:</strong> No data is kept in memory or storage. If you do not download the file to your computer or device when prompted, it will no longer exist.</small>';
	statusSave.className='success';
}

// Export progress (convert formData to JSON and then force a download)
async function exportJSON(){
	
	var answer = confirm("This option should ONLY be used in emergencies (such as repairing corrupt data).\n\nIt will export an UNENCRYPTED JSON file that can be read by ANYONE who has access to your device!\n\nAre you ABSOLUTELY sure?");
	if (!answer){
		alert("Action cancelled!");
		return false;
	}
	
	var savedFormData = new Array();
	var completedResponses = 0;
	// Clear down in-memory array/objects
	for (const k in ephemeralFormData) {
		delete ephemeralFormData[k];
	}
	ephemeralFormData.length = 0;
	
	// Wrangle the date into a workable format (YYYY-MM-DD-hh-mm-ss-ms)
	let date = new Date().toISOString();
	let fdate = date.split("_").join("-").replace(/T/, '-').replace(/:/g, '-').replace(/\..+/, '') + "-utc";
	// Build the PDF filename (based on name field - id = 9)
	let pname = ($("#db-you-name").val()) ? $("#db-you-name").val().replace(/ /g,"-") + "-deathbox-progress" : "unknown-person-deathbox-progress";
	
	$("input, textarea").each(function(){
		$(this).attr("value", $(this).val());
	});

	$(".section").each(function(){
		var d = {};
		d.title = $(this).find(".section-header").ignore("span").text();
		d.description = $(this).find(".section-description").text();
		d.fields = [];
		$(this).find(".field").each(function(){
			// repeatable-container
			var repeat = false;
			if ($(this).find(".repeatable-container").length > 0){
				repeat = true;
			}
			// Repeated (dynamically added fieldset)
			if ($(this).find(".subsection").length > 1){
				$(this).find(".subsection").each(function(){
					var subsection = $(this).not("span").text();
					subsection = subsection.replace(/ *\([^)]*\) */g, "");
					var ssdesc = $(this).find(".subsection-description").text();
					if ($(this).parent().find(".field").length > 0){
						var subfields = [];
						$(this).parent().find(".field").each(function(){	
							var value = $(this).find(":input").attr("value");
							var description = $(this).find(":input").attr("title");
							var id = $(this).find(":input").attr("id");
							//console.log(value);
							if (value !== ""){
								completedResponses++;
							}
							subfields.push({name:$(this).attr("data-label"), value:value, description:description, id:id});
						});
						if (repeat){
							d.fields.push({name:subsection, description:ssdesc, repeat:true, fields:subfields});
						} else {
							d.fields.push({name:subsection, description:ssdesc, fields:subfields});
						}
					}
				});
			} else {
				var subsection = $(this).find(".subsection").text();
				subsection = subsection.replace(/ *\([^)]*\) */g, "");
				var ssdesc = $(this).find(".subsection-description").text();
				if ($(this).find(".field").length > 0){
					var subfields = [];
					$(this).find(".field").each(function(){
						var value = $(this).find(":input").attr("value");
						var description = $(this).find(":input").attr("title");
						var id = $(this).find(":input").attr("id");
						//console.log(value);
						if (value !== ""){
							completedResponses++;
						}
						subfields.push({name:$(this).attr("data-label"), description:description, value:value, id:id});
					});
					if (repeat){
						d.fields.push({name:subsection, description:ssdesc, repeat:true, fields:subfields});
					} else {
						d.fields.push({name:subsection, description:ssdesc, fields:subfields});
					}
				}
			}
		});
		ephemeralFormData.push(d);
	});
	// Finally, add the marked sections to the array
	ephemeralFormData.push(sectionsMarkedArray);
	var json = JSON.stringify(ephemeralFormData);
	//console.log("ephemeralFormData JSON: " + json);
	let size = json.length;
	let filename = pname + "-" + fdate + ".json";
	triggerDownload(json,filename,'application/json');
	statusSave.innerHTML='JSON file successfully exported ('+completedResponses+' non-empty values)<br><small class="description"><strong>Size:</strong> ' +size+' bytes</small><br><small class="description"><strong>Note:</strong> No data is kept in memory or storage. If you do not download the file to your computer or device when prompted, it will no longer exist.</small>';
	statusSave.className='success';
	return false;
}

// Save Progress
saveBtn.addEventListener('click', saveProgress);

// Export JSON Progress
exportBtn.addEventListener('click', function(e){
	e.preventDefault();
	exportJSON();
	return false;
});

// Generate and download a PDF
generateBtn.addEventListener('click', generatePDFFromForm);

// Encryption/Decryption helpers
async function encryptData(arrayBuffer, passphrase){
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), {name:'PBKDF2'}, false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:150000, hash:'SHA-512'}, baseKey, {name:'AES-GCM', length:256}, false, ['encrypt']);
    const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, arrayBuffer);
    const combined = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.byteLength);
    combined.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);
    return combined;
}

// ArrayBuffer to String - this one causes a call stack overflow in chrome (works in firefox)
function ab2str_old(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// ArrayBuffer to String - this one works in chrome and firefox
function ab2str( buffer ) {
	var d = new Uint16Array(buffer).reduce(function (data, byte) {
		return data + String.fromCharCode(byte);
	},'');
	return d;
}

// String to ArrayBuffer
function str2ab(str) {
	var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i=0, strLen=str.length; i<strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

// ArrayBuffer to Array
function ab2ary(buf){
	var array = new Uint16Array(buf);
	return array;
}

// Array to ArrayBuffer
function ary2ab(array) {
	var length = array.length;
	var buffer = new ArrayBuffer( length * 2 );
	var view = new Uint16Array(buffer);
	for ( var i = 0; i < length; i++) {
		view[i] = array[i];
	}
	return buffer;
}

// Generate random string
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Function to encode a UTF-8 string to Base64
function utf8ToBase64(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    const binaryString = String.fromCharCode.apply(null, data);
    return btoa(binaryString);
}

// Function to decode a Base64 string to UTF-8
function base64ToUtf8(b64) {
    const binaryString = atob(b64);
    // Create a Uint8Array from the binary string.
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

// This re-indexes the form to prevent duplicate element IDs
function reIndexForm(){
	console.log("reIndexForm: Re-indexing form...");
	var idx = 0;
	$("input, textarea").each(function(){
		// Remove any hash from the id
		var id = $(this).attr("id").replace("#","");
		// Remove the db_ string
		id = id.replace("db_","");
		// Check for numeric id only
		if (isNaN(id)){
			// Ignore reserved, non-numeric element IDs
			console.log("reIndexForm: Ignoring reserved ID: " + id);
		} else {
			// Re-index elements
			console.log("reIndexForm: New field ID: db_" + idx);
			$(this).attr("id", "db_"+idx);
			idx++;
		}
		// Update all relevant fields to password type
		if ($(this).attr("name") == "Password" || $(this).attr("name") == "Pin/Passcode" || $(this).attr("name") == "Combination/Passcode" || $(this).attr("name") == "Password/Code" || $(this).attr("name") == "Credit / Debit Card Pin" || $(this).attr("name") == "CCV Code" || $(this).attr("name") == "SSID Password" || $(this).attr("name") == "Control Panel Password" || $(this).attr("name") == "Mobile Banking App PIN / Passcode"){
			$(this).attr("type","password");
			$(this).on("focus",function(){
				if ($(this).attr("type") == "password"){
					$(this).attr("type","text");
				}
			})
			.on("blur",function(){
				if ($(this).attr("type") == "text"){
					$(this).attr("type","password");
				}
			})
		}
		//$(this).attr("value", $(this).val());
	});
}

// Reset the form and remove any duplicated subsections
function clearFormData(){
	console.log("clearFormData called");
	// Reset form data to default
	const container = document.getElementById('pdfRender');
    container.innerHTML = '';
	formEl.innerHTML = '';
	subSectionFields = [];
	sections = [];
	sectionsMarkedArray = [];
	s = 0;
	fid = 0;
	lastField = null;
	fCount = 0;
	loading = false;
	firstload = true;
	mergeConfirm = false;
	dupe = false;
	dupecount = 0;
	formData = origFormData;
	console.log("clearFormData: calling createForm");
	createForm();
	$(".cb-section").prop("checked",false);
	console.log("clearFormData: calling updateProgressBar");
	updateProgressBar();
}

// ---------------- Encrypt/Decrypt ----------------

// Perform some basic sanity checks before files are processed
$("#fileInput, #fileInputProgress").on("change", function(){
	$(".file-size, .file-error").remove();
	if (typeof FileReader !== "undefined") {
		var filesize = formatBytes(this.files[0].size);
		var filename = this.files[0].name;
		var filetype = this.files[0].type;	 // Returns empty for our custom *.enc files :|
		// Get suffix from filename (hacky, but hey)
		var suffix = filename.split(".").pop().toLowerCase();
		// Stop the obvious error - uploading a PDF (this never happens as all uploads are *.enc files!)
		if (suffix == "pdf"){

			$(this).after('<small class="file-comment file-error">You need to select an encrypted file that ends with \'.enc\'.</small>');
			
			if (this.id == "fileInput"){
				alert("It looks like you are trying to upload a PDF. This is not how a DeathBox works.\n\nYou need to select an encrypted file that ends with '.enc' and provide the correct passphrase.\n\nAfter this, you'll be able to download the decrypted PDF.");
				
				$("#statusDecrypt").text("It looks like you are trying to select a PDF. This is not how a DeathBox works. You need to select an encrypted file that ends with '.enc' and provide the correct passphrase. After this, you'll be able to download the decrypted PDF.").addClass("error");
			} else {
				alert("It looks like you are trying to upload a PDF. This is not how a DeathBox works.\n\nYou need to select an encrypted file that ends with '.enc' and provide the correct passphrase.\n\nAfter this, you'll be able to resume your progress.");
				
				$("#statusDecryptProgress").text("It looks like you are trying to select a PDF. This is not how a DeathBox works. You need to select an encrypted file that ends with '.enc' and provide the correct passphrase. After this, you'll be able to resume your progress.").addClass("error");
			}
			
			return false;
		}
		if (suffix != "enc"){

			if (this.id == "fileInput"){
				
				alert("Incorrect format detected.\n\nYou need to select an encrypted file that ends with '.enc' and provide the correct passphrase.\n\nAfter this, you'll be able to download the decrypted PDF.");
				
				$("#statusDecrypt").text("Incorrect format detected. You need to select an encrypted file that ends with '.enc' and provide the correct passphrase. After this, you'll be able to download the decrypted PDF.").addClass("error");
			} else {
				$("#statusDecryptProgress").text("Incorrect format detected. You need to select an encrypted file that ends with '.enc' and provide the correct passphrase. After this, you'll be able to resume your progress.").addClass("error");
				
				alert("Incorrect format detected.\n\nYou need to select an encrypted file that ends with '.enc' and provide the correct passphrase.\n\nAfter this, you'll be able to resume your progress.");
			}
			
			$(this).after('<small class="file-comment file-error">Incorrect format detected! The filename should end in \'.enc\'</small>');
			
			return false;
		}
		$(this).after('<small class="file-comment file-size">File ready for processing ('+filesize+')</small>');
	}
});

const passInput=document.getElementById('passphrase'); 
const decryptBtn=document.getElementById('decryptBtn');
const status=document.getElementById('status');
const statusSave=document.getElementById('statusSave');
const statusDecrypt=document.getElementById('statusDecrypt');
const statusDecryptProgress=document.getElementById('statusDecryptProgress');

const fileInputProgress=document.getElementById('fileInputProgress');
const passInputProgress=document.getElementById('passphraseProgress');
const decryptBtnProgress=document.getElementById('decryptBtnProgress');

// Get the passphrase and generate a key
async function importKey(passphrase,salt){ 
    const enc=new TextEncoder();
    const baseKey=await crypto.subtle.importKey('raw',enc.encode(passphrase),{name:'PBKDF2'},false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:150000, hash:'SHA-512'}, baseKey,{name:'AES-GCM',length:256},false,['decrypt']);
}

// Decrypt PDF file array buffer
async function decryptPDF(encryptedArrayBuffer,passphrase){
    const data=new Uint8Array(encryptedArrayBuffer);
    if(data.length<28) throw new Error('Invalid file');
    const salt=data.slice(0,16);
	const iv=data.slice(16,28);
	const ciphertext=data.slice(28);
    const key=await importKey(passphrase,salt);
    return crypto.subtle.decrypt({name:'AES-GCM',iv},key,ciphertext);
}

// Decrypt progress file array buffer
async function decryptProgressHTML(encryptedArrayBuffer,passphrase){
    const data=new Uint8Array(encryptedArrayBuffer);
    if(data.length<28) throw new Error('Invalid file');
    const salt=data.slice(0,16);
	const iv=data.slice(16,28);
	const ciphertext=data.slice(28);
    const key=await importKey(passphrase,salt);
    return crypto.subtle.decrypt({name:'AES-GCM',iv},key,ciphertext);
}

// Create a checksum for downloaded PDFs
async function createChecksum(buffer) {

	// hash the message
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	
	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	
	// convert bytes to hex string
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}

// Decrypt an uploaded PDF file (*.enc) and force a download of the decrypted PDF file
decryptBtn.addEventListener('click',()=>{

    statusDecrypt.textContent='';
	statusDecrypt.className='';
    const file=fileInput.files[0];
	const passphrase=passInput.value;
	
	if (!file || !passphrase){
		statusDecrypt.textContent="You need to select an encrypted file and enter the passphrase.";
		statusDecrypt.className='error';
		return false;
	}
	
	// Uploaded file name
	var filename = fileInput.files[0].name;
	// PDF filename (just change the suffix)
	var pdf_filename = filename.replace(".enc",".pdf");
	// Filename example: First-Middle-Last-deathbox-2025-11-24-21-23-45-utc.enc
    if(!file||!passphrase){ statusDecrypt.textContent='Select file and enter passphrase'; statusDecrypt.className='error'; return; }
    const reader=new FileReader();
    reader.onload=async e=>{
        try{
            const decryptedArrayBuffer=await decryptPDF(e.target.result,passphrase);
			// If we've got valid JSON, the user has uploaded and decrypted a progress file by mistake (which is basically JSON)
			// We obviously need to prevent this as we don't want them downloading a JSON file with a PDF suffix!
			try {
				var decryptedJSON = ab2str(decryptedArrayBuffer);
				if (isJson(decryptedJSON)){
					alert("It looks like you've selected a progress file by mistake. Use the 'Load Progress' section above for that.");
					throw ("progressfile");
				}
			} catch(err) {
				if (err == "progressfile"){
					statusDecrypt.textContent="It looks like you've selected a progress file by mistake. Use the 'Load Progress' section above for that.";
					statusDecrypt.className='error';
					return false
				} else {
					triggerDownload(decryptedArrayBuffer,pdf_filename,'application/pdf');
            		statusDecrypt.textContent='Decryption successful! PDF downloaded.'; statusDecrypt.className='success';
				}
			}
			//console.log(decryptedArrayBuffer);    
        } catch(err){
			console.error(err);
			statusDecrypt.textContent="Decryption failed. Check passphrase/file. Make sure you are not attempting to select a progress file by mistake. Use the 'Load Progress' section above for that.";
			statusDecrypt.className='error';
		}
    };
    reader.readAsArrayBuffer(file);
});

// Decrypt an uploaded PROGRESS file (*.enc) and populate the form
decryptBtnProgress.addEventListener('click',()=>{
	
	statusDecryptProgress.textContent='';
	statusDecryptProgress.className='';
    const fileProgress=fileInputProgress.files[0];
	const passphraseProgress=passInputProgress.value;
	
	if (!fileProgress || !passphraseProgress){
		statusDecryptProgress.textContent="You need to select an encrypted file and enter the passphrase.";
		statusDecryptProgress.className='error';
		return false;
	}
	
	var answer = confirm("You are about to process the selected file and OVERWRITE the COMPLETE form with its contents.\n\nIf the file is corrupt you will lose all of your data. To be on the safe side, you might want to cancel and save your progress first using the option above.\n\nAre you ABSOLUTELY sure?");
	if (!answer){
		alert("Action cancelled!");
		return false;
	}

	// Clear down form so we have fresh DOM IDs and counts
	formData = [];
	s = 0;
	fid = 0;
	lastField = null;
	fCount = 0;
	loading = false;
	subSectionFields = [];
	dupe = false;
	dupecount = 0;
	
    if(!fileProgress||!passphraseProgress){
		statusDecryptProgress.textContent='Select file and enter passphrase';
		statusDecryptProgress.className='error';
		return;
	}
    const reader=new FileReader();
    reader.onload=async e=>{
        try{
            const decryptedArrayBufferProgress=await decryptProgressHTML(e.target.result,passphraseProgress);
			var decryptedJSON = ab2str(decryptedArrayBufferProgress);
			//console.log(decryptedJSON);
			
			// Overwrite the global formData object with the decrypted JSON
			formData = JSON.parse(decryptedJSON);
			
			// Check if the last value is an array (if so, it's a record of the 'marked as complete' sections)
			if (formData[formData.length - 1].constructor === Array){
				// Pop it off  - we only need it to restore checkbox states
				sectionsMarkedArray = formData.pop();
			} else {
				// Value is not an array, we don't have any saved marked sections
				sectionsMarkedArray = [];
			}
			
			// Deep enumeration to see how many non-empty values we've restored
			var restoredResponses = 0;
			for (o in formData){
				for (f in formData[o].fields){
					for (v in formData[o].fields[f].fields){
						// This is the lowest level (i.e. individual fields)
						if (formData[o].fields[f].fields[v].value !== ""){
							restoredResponses++;
						}
					}
				}
			}
					
			// Compare origFormData with formData to see if there's any new SECTIONS
			var diffArray  = origFormData.filter(o=> !formData.some(i=> i.title === o.title));
			
			// If there's at least one whole new section
			if (diffArray.length > 0){
				var verb = diffArray.length == 1 ? "is" : "are";
				var noun = diffArray.length == 1 ? "section" : "sections";
				var pronoun = diffArray.length == 1 ? "it" : "them";
				var difnames = [];
				for (d in diffArray){
					difnames.push(diffArray[d].title);
				}
				var sections_csv = difnames.join(",");
				var answer = confirm("There " + verb + " " + diffArray.length + " new " + noun +" since you last saved your progress ("+sections_csv+").\n\nThis is not an error! It's because I've updated the base template.\n\nDo you wish to include the new "+ noun +" now? Doing so will NOT overwrite any of your existing information.");
				if (answer){
					diffArray.forEach(newsection=>{
						formData.push(newsection);
					});
				}
			}
			
			// Build new form
			loading = true;
			subSectionFields = [];
			console.log("decryptBtnProgress: calling createForm()");
			createForm();
			
			// If enabled, scroll to top of form after progress is loaded
			if (scrollToFormOnProgressLoad){
				setTimeout(function(){
					$('html').animate({
						scrollTop: $("a[name='form']").offset().top
					}, 500);
				}, 1000);
			}
			
            statusDecryptProgress.textContent='File decryption successful! '+restoredResponses+' non-empty values restored.';
			statusDecryptProgress.className='success';
        } catch(err){
			console.error(err);
			statusDecryptProgress.textContent="Decryption failed. Check passphrase/file. Make sure you're not selecting an encrypted PDF file by mistake. Use the 'Decrypt PDF' section below for that.";
			statusDecryptProgress.className='error';
		}
    };
    reader.readAsArrayBuffer(fileProgress);
});

// Force a download
function triggerDownload(data, filename, mime) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
	// Clear down in-memory array/objects
	for (const k in ephemeralFormData) {
		delete ephemeralFormData[k];
	}
	ephemeralFormData.length = 0;
	//console.log(ephemeralFormData);
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) {
		return '0 Bytes';
	}
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
