import React from 'react'
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import Swal from 'sweetalert2';
import Select2 from '@/Components/Select2';

export default function Edit() {

    // destruct roles and user from usepage props
    const { user, roles } = usePage().props;

    // define state with helper inertia
    const { data, setData, put, errors } = useForm({
        name : user.name,
        email: user.email,
        selectedRoles : user.roles.map(role => role.name),
    });

    const formattedRoles = roles.map(role => ({
        value: role.name,
        label: role.name
    }));

    // Get default selected roles for Select2
    const defaultSelectedRoles = user.roles.map(role => ({
        value: role.name,
        label: role.name
    }));



    // define method handleSelectedroles
    const handleSelectedRoles = (selected) => {
        const selectedValues = selected ? selected.map(option => option.value) : [];
        setData('selectedRoles', selectedValues);
    }

    // define method handleUpdateData
    const handleUpdateData = async (e) => {
        e.preventDefault();

        put(route('users.update', user.id), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Data updated successfully!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        });
    }

    return (
        <DashboardLayout title="Edit User">
            <Head title={'Edit User'}/>
                <Card title={'Edit user'}>
                    <form onSubmit={handleUpdateData}>
                        <div className='mb-4'>
                            <Input label={'Name'} type={'text'} value={data.name} onChange={e => setData('name', e.target.value)} errors={errors.name} placeholder="Input name user.."/>
                        </div>
                        <div className='mb-4'>
                            <Input label={'Email'} type={'email'} value={data.email} onChange={e => setData('email', e.target.value)} errors={errors.email} placeholder="Input email user.."/>
                        </div>
                          <div className='mb-4'>
                            <div className='flex items-center gap-2 text-sm text-gray-700'>
                                        Roles
                            </div>
                            <Select2 
                                isMulti={true}
                                value={defaultSelectedRoles}
                                onChange={handleSelectedRoles}  
                                options={formattedRoles}  
                                placeholder="Pilih Role..." 
                            />
                            {errors.selectedRoles && <div className='text-xs text-red-500 mt-1'>{errors.selectedRoles}</div>}
                        </div>
                       
                        <div className='flex items-center gap-2'>
                            <Button type={'submit'} />
                            <Button type={'cancel'} url={route('users.index')}/>
                        </div>
                    </form>
                </Card>
        </DashboardLayout>
    )
}
